import express, { Application, Request, Response, NextFunction } from 'express';
import { AppError, errorHandler, notFound } from './middleware/error_middleware';
import RateLimitInstance from './middleware/rate_limit_middleware';
import Routes from './routes';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

const app: Application = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(RateLimitInstance.globalRateLimit());

app.use('/api', Routes);

app.use(notFound);
app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction ) => {
    errorHandler(err, req, res, next);
});

export default app;

