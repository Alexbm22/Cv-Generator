import cv_routes from './cv';
import stripe_routes from './stripe';
import express from 'express';

const router = express.Router();

router.use('/cvs', cv_routes);
router.use('/stripe', stripe_routes);

export default router;