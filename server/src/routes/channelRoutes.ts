import express from 'express';
import { createChannel, getChannels, deleteChannel } from '../controllers/channelController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createChannel);
router.get('/:groupId', getChannels);
router.delete('/:id', deleteChannel);

export default router;
