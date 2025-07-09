import { User } from "../models";

export class UserServices {
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

    generateRandomSufix(length: number){
        const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    async isUniqueUsername(username: string): Promise<boolean> {
        const user = await User.findOne({where: { username }})
        if(user) return false;
        return true;
    }
}