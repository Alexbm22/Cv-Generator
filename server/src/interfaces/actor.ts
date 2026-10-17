export type UserId = number;

export type AccountType = 'guest' | 'registered';

export type GuestActor = {
    type: 'guest';
    id: UserId;
};

export type RegisteredActor = {
    type: 'registered';
    id: UserId;
    email: string;
    username: string | null;
};

export type Actor = GuestActor | RegisteredActor;

export const isRegistered = (actor: Actor): actor is RegisteredActor => actor.type === 'registered';

declare global {
    namespace Express {
        interface Request {
            actor?: Actor;
        }
    }
}
