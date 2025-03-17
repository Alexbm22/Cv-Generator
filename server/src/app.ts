import express, { Application, Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, notFound } from './middleware/error_middleware';
import cors from 'cors';
import helmet from 'helmet';

const app: Application = express();

app.use(cors({
    origin : "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(notFound);
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction ) => {
    errorHandler(err, req, res, next);
});

export default app;

