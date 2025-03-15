import express,{ Application } from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const app:Application = express();
const server = http.createServer(app);

app.use(cors({
    origin : "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

const PORT:number = Number(process.env.PORT) || 5001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});