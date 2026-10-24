import sequelize from './database_config';
import { seedAiConfig } from './seeds/ai-config.seed';
import { resetDatabase } from './database_init';

async function main(): Promise<void> {
    const command = process.argv[2];

    await sequelize.authenticate();
    try {
        switch (command) {
            case 'seed:ai':
                await seedAiConfig();
                break;
            case 'reset':
                await resetDatabase();
                break;
            default:
                throw new Error(`Unknown command: ${command ?? '(none)'}`);
        }
    } finally {
        await sequelize.close();
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
