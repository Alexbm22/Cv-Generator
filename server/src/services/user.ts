import { UserAttributes, UserProfile } from "../interfaces/user";
import { User } from "../models";
import { SubscriptionService } from "./subscriptions";
import { CreditsService } from "./credits";
import { PaymentService } from "./payments";

export class UserServices {

    static async mapToProfile(user: User): Promise<UserProfile> {
        const userData = user.get()

        // add here any user profile data
        const userActiveSubscription = await SubscriptionService.getUserSubscription(userData.id);
        const userCredits = await CreditsService.getUserCredits(userData.id);
        const userPayments = await PaymentService.getUserPayments(userData.id);
        const accountData = user.toSafeUser();

        const userProfile = {
            username: accountData.username,
            email: accountData.email,
            profilePicture: accountData.profilePicture,
            subscription: userActiveSubscription,
            credits: userCredits,
            payments: userPayments
        }

        return userProfile
    }

    async generateUsername(given_name: string, family_name: string): Promise<string> {
        const baseUsername = [given_name, family_name]
            .filter(name => name?.trim())
            .join('-') || 'user';

        if (await this.isUniqueUsername(baseUsername)) {
            return baseUsername;
        }
        
        let sufixLen = 4;
        for(let i = 0; i < 4; i++) {
            for(let j = 0; j < 4; j++){
                const resultedUsername = `${baseUsername}.${this.generateRandomSufix(sufixLen)}`;
                const isUnique = await this.isUniqueUsername(resultedUsername);
                if(isUnique) return resultedUsername;
            }
            sufixLen++;
        }

        return `user-${Date.now()}.${this.generateRandomSufix(6)}`;
    }

    async isUniqueUsername(username: string): Promise<boolean> {
        const user = await User.findOne({where: { username }})
        if(user) return false;
        return true;
    }

    generateRandomSufix(length: number){
        const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

}