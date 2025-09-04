import * as ProtectedRoutes from './protected/'
import express from 'express';

const router = express.Router();

router.use('/user', ProtectedRoutes.user_routes);
router.use('/downloads', ProtectedRoutes.downloads_routes);
router.use('/cvs', ProtectedRoutes.cv_routes);
router.use('/stripe', ProtectedRoutes.stripe_routes);
router.use('/media_files', ProtectedRoutes.mediaFiles_routes)

export default router;