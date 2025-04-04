import express from 'express';
import auth_routes from './auth_routes'
import { authMiddleware } from '../middleware/auth_middleware';

const router = express.Router();

router.use('/auth', auth_routes);

//to be added to all routes that need authentication
router.use('/protected', authMiddleware, ); 


export default router;


