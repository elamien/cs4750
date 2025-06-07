import express from 'express';
import bandController from './bandController.js';
import membershipController from './membershipController.js';
import leadershipController from './leadershipController.js';
import eventController from './eventController.js';

const router = express.Router();

// Mount the different controllers
router.use('/', bandController);           // Basic band CRUD operations
router.use('/', membershipController);     // Membership requests and approval/rejection
router.use('/', leadershipController);     // Leadership management (promote, remove, leave)
router.use('/', eventController);          // Event invitations and availability

export default router; 