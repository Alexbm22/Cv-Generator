import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import http from 'http';
import dotenv from 'dotenv';
import { AppError, errorHandler, notFound } from './middleware/error_middleware';

dotenv.config();

const app:Application = express();
const server = http.createServer(app);

app.use(cors({
    origin : "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

app.use(notFound);
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction ) => {
    errorHandler(err, req, res, next);
});

const PORT:number = Number(process.env.PORT) || 5001;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});