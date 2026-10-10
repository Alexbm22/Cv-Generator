import express from 'express';
import auth_routes from './auth';
import protectedRoutes from './protected';
import ai_routes from './ai';
import { authMiddleware } from '../middleware/auth_middleware';
import passwordRoutes from './password';

const router = express.Router();

router.use('/auth', auth_routes);
router.use('/ai', ai_routes);
router.use('/password', passwordRoutes);

//to be added to all routes that need authentication
router.use('/protected', authMiddleware, protectedRoutes); 

export default router;


