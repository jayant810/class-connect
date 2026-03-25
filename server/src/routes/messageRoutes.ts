import express from 'express';
import { createMessage, getMessages, verifyMessage, flagMessage } from '../controllers/messageController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createMessage);
router.get('/:channelId', getMessages);
router.post('/:id/verify', verifyMessage);
router.post('/:id/flag', flagMessage);

export default router;
