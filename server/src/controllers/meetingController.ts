import { Request, Response } from 'express';
import pool from '../db/index.js';

export const createMeeting = async (req: any, res: Response) => {
  const { groupId, channelId, meetingLink } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO meetings (group_id, channel_id, created_by, meeting_link) VALUES ($1, $2, $3, $4) RETURNING *',
      [groupId, channelId, userId, meetingLink]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('CreateMeeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMeetings = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM meetings WHERE group_id = $1 ORDER BY created_at DESC',
      [groupId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetMeetings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
