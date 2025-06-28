import cv_routes from './cv_routes';
import express from 'express';

const router = express.Router();

router.use('/cv', cv_routes);

export default router;