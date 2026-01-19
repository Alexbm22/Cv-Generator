import { PublicUserAttributes, ServerUserAttributes } from "@/interfaces/user";

const mapServerUserToPublicUser = (user: ServerUserAttributes): PublicUserAttributes => {
    return {
        id: user.public_id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        needsInitialSync: user.needsInitialSync
    };
}

export default {
    mapServerUserToPublicUser
}