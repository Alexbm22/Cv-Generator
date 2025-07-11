import express, { Application, Request, Response, NextFunction } from 'express';
import Routes from './routes';
import stripeWebHook from './routes/stripeWebHook';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import Stripe from 'stripe';
import helmet from 'helmet';
import { AppError, catchAsync, errorHandler, notFound } from './middleware/error_middleware';
import RateLimitInstance from './middleware/rate_limit_middleware';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const app: Application = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}));

app.use(cookieParser());
app.use(helmet());
app.use(express.urlencoded({ extended: true }));

app.use(RateLimitInstance.globalRateLimit());

app.use(
    '/webhook', 
    express.raw({ type: 'application/json' }), 
    stripeWebHook
);

app.use(express.json());
app.use('/api', Routes);

app.use(notFound);
app.use((err: AppError, req: Request, res: Response, next: NextFunction ) => {
    errorHandler(err, req, res, next);
});

export default app;

