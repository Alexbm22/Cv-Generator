import sequelize from './database_config';
import { migrator } from './migrator';
import { seedAiConfig } from './seeds/ai-config.seed';

async function main(): Promise<void> {
    const command = process.argv[2];

    await sequelize.authenticate();
    try {
        switch (command) {
            case 'migrate':
                await migrator.up();
                break;
            case 'migrate:down':
                await migrator.down();
                break;
            case 'seed:ai':
                await seedAiConfig();
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
