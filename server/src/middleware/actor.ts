import crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { GuestActor, RegisteredActor } from '@/interfaces/actor';
import { User } from '@/models';
import userRepository from '@/repositories/user';
import { AuthTokenService } from '@/services/tokens';
import { UserService } from '@/services/user';
import { CookieService, GUEST_COOKIE_NAME, REFRESH_COOKIE_NAME } from '@/services/cookie';
import { catchAsync } from './error_middleware';

// Avoids a DB write on every request; last_seen_at is only refreshed when older than this.
const LAST_SEEN_UPDATE_INTERVAL_MS = 60 * 60 * 1000;

const tokenService = new AuthTokenService();

export const hashGuestToken = (token: string): string =>
    crypto.createHash('sha256').update(token).digest('hex');

export const toRegisteredActor = (user: User): RegisteredActor | null => {
    const email = user.get('email');
    if (user.get('type') !== 'registered' || !email) {
        return null;
    }

    return {
        type: 'registered',
        id: user.get('id'),
        email,
        username: user.get('username'),
    };
};

const resolveRegisteredFromSession = async (req: Request): Promise<RegisteredActor | null> => {
    const token = req.cookies?.[REFRESH_COOKIE_NAME];
    if (typeof token !== 'string') {
        return null;
    }

    const decoded = tokenService.decodeRefreshToken(token);
    if (!decoded) {
        return null;
    }

    const user = await UserService.getUser({ id: decoded.user_id, tokenVersion: decoded.version });
    return user ? toRegisteredActor(user) : null;
};

const resolveGuest = async (req: Request): Promise<GuestActor | null> => {
    const token = req.cookies?.[GUEST_COOKIE_NAME];
    if (typeof token !== 'string') {
        return null;
    }

    const guest = await userRepository.getUserByFields({
        guestTokenHash: hashGuestToken(token),
        type: 'guest',
    });
    if (!guest) {
        return null;
    }

    const now = new Date();
    const lastSeenAt = guest.get('lastSeenAt');
    if (!lastSeenAt || now.getTime() - lastSeenAt.getTime() > LAST_SEEN_UPDATE_INTERVAL_MS) {
        await userRepository.updateUserByFields({ lastSeenAt: now }, { id: guest.get('id') });
    }

    return { type: 'guest', id: guest.get('id') };
};

const createGuest = async (res: Response): Promise<GuestActor> => {
    const token = crypto.randomBytes(32).toString('base64url');

    const guest = await User.create({
        type: 'guest',
        guestTokenHash: hashGuestToken(token),
        lastSeenAt: new Date(),
        authProvider: 'local',
        isActive: true,
        needsInitialSync: true,
    });

    CookieService.setGuestToken(token, res);
    return { type: 'guest', id: guest.get('id') };
};

// Resolution order: registered session, then guest cookie, then (optionally) a new guest.
export const resolveActor = ({ create }: { create: boolean }) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const actor =
            (await resolveRegisteredFromSession(req))
            ?? (await resolveGuest(req))
            ?? (create ? await createGuest(res) : null);

        if (actor) {
            req.actor = actor;
        }

        next();
    });

export const requireRegistered = (req: Request, res: Response, next: NextFunction): void => {
    if (req.actor?.type === 'registered') {
        next();
        return;
    }

    res.status(401).json({ code: 'REGISTRATION_REQUIRED' });
};
