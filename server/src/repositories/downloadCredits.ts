import { DownloadCredits } from '@/models';

const getUserCredits = async (user_id: number) => {
    return DownloadCredits.findOne({ 
        where: { user_id } 
    });
};

const updateCredits = async (user_id: number, newCreditsAmount: number) => {
    const [updatedCount] = await DownloadCredits.update(
        { credits: newCreditsAmount }, 
        { where: { user_id } }
    );
    return updatedCount > 0;
};

const createUserCredits = async (user_id: number, credits: number) => {
    return DownloadCredits.create({ 
        user_id, 
        credits 
    });
};

const findOrCreateUserCredits = async (user_id: number, defaultCredits: number = 1) => {
    const [userCredits, created] = await DownloadCredits.findOrCreate({
        where: { user_id },
        defaults: { user_id, credits: defaultCredits }
    });
    return { userCredits, created };
};

export default {
    getUserCredits,
    updateCredits,
    createUserCredits,
    findOrCreateUserCredits
};