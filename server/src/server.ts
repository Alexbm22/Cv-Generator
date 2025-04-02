import app from './app';
import sequelize from './config/database_config';
import { initModels } from './models';

const PORT: number = Number(process.env.PORT) || 5001;

const startServer = async () => {
    try {
        await sequelize.authenticate();

        await initModels();

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start the server", error);
        process.exit(1);
    }
}

startServer();