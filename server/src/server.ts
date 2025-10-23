import app from './app';
import sequelize from './config/DB/database_config';
import https from 'https';
import fs from 'fs';
import { config } from './config/env';
import { initModels } from './config/DB/database_init';

const PORT: number = config.PORT;

const keyPath = config.SSL_KEY_PATH;
const certPath = config.SSL_CERT_PATH;

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