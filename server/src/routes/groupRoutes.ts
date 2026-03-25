import express from 'express';
import { createGroup, getGroups, joinGroup, getGroupMembers } from '../controllers/groupController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createGroup);
router.get('/', getGroups);
router.post('/join', joinGroup);
router.get('/:id/members', getGroupMembers);

export default router;
