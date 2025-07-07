import cv_routes from './cv_routes';
import express from 'express';

const router = express.Router();

router.use(cv_routes);

export default router;