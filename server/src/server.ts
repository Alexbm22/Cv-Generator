import app from './app';
import sequelize from './config/database_config';
import https from 'https';
import fs from 'fs';
import { initModels } from './models';

const PORT: number = Number(process.env.PORT) || 5001;

const keyPath = process.env.SSL_KEY_PATH;
const certPath = process.env.SSL_CERT_PATH;

if (!keyPath || !certPath) {
  throw new Error("SSL_KEY_PATH and SSL environment variables must be set");
} 

const sslOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
};

const startServer = async () => {
    try {
        await sequelize.authenticate();
        await initModels();

        https.createServer(sslOptions, app).listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start the server", error);
        process.exit(1);
    }
}

startServer();