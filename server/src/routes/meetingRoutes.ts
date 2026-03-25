import express from 'express';
import { createMeeting, getMeetings } from '../controllers/meetingController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createMeeting);
router.get('/:groupId', getMeetings);

export default router;
