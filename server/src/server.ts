import app from './app';
import sequelize from './config/DB/database_config';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { config } from './config/env';
import { initModels } from './config/DB/database_init';
import { startDownloadPendingCleanup } from './services/downloadPendingCleanup';

const PORT: number = config.PORT;

const keyPath = config.SSL_KEY_PATH;
const certPath = config.SSL_CERT_PATH;

if (Boolean(keyPath) !== Boolean(certPath)) {
  throw new Error("SSL_KEY_PATH and SSL_CERT_PATH must be set together");
}

// Render terminates TLS at its proxy, so plain HTTP is used when no certificate is configured.
const server = keyPath && certPath
  ? https.createServer({
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }, app)
  : http.createServer(app);

const startServer = async () => {
    try {
        await sequelize.authenticate();
        await initModels();
        startDownloadPendingCleanup();

        server.listen(PORT, () => {
          console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start the server", error);
        process.exit(1);
    }
}

startServer();