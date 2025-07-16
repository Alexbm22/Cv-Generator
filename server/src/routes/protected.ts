import cv_routes from './cv';
import stripe_routes from './stripe';
import user_routes from './user';
import downloads_routes from './downloads';
import express from 'express';

const router = express.Router();

router.use('/user', user_routes);
router.use('/downloads', downloads_routes);
router.use('/cvs', cv_routes);
router.use('/stripe', stripe_routes);

export default router;