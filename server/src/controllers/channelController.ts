import { Request, Response } from 'express';
import pool from '../db/index.js';

export const createChannel = async (req: any, res: Response) => {
  const { groupId, name, category } = req.body;
  const userId = req.user.id;

  try {
    // Check if user is owner or admin of the group
    const membership = await pool.query(
      'SELECT role FROM group_members WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );

    if (membership.rows.length === 0 || (membership.rows[0].role !== 'owner' && membership.rows[0].role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners or admins can create channels' });
    }

    const result = await pool.query(
      'INSERT INTO channels (group_id, name, category) VALUES ($1, $2, $3) RETURNING *',
      [groupId, name, category || 'Text Channels']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('CreateChannel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getChannels = async (req: Request, res: Response) => {
  const { groupId } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM channels WHERE group_id = $1 ORDER BY created_at ASC',
      [groupId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetChannels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteChannel = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const channelResult = await pool.query('SELECT group_id FROM channels WHERE id = $1', [id]);
    if (channelResult.rows.length === 0) {
      return res.status(404).json({ message: 'Channel not found' });
    }

    const groupId = channelResult.rows[0].group_id;

    const membership = await pool.query(
      'SELECT role FROM group_members WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );

    if (membership.rows.length === 0 || (membership.rows[0].role !== 'owner' && membership.rows[0].role !== 'admin')) {
      return res.status(403).json({ message: 'Only owners or admins can delete channels' });
    }

    await pool.query('DELETE FROM channels WHERE id = $1', [id]);
    res.json({ message: 'Channel deleted successfully' });
  } catch (error) {
    console.error('DeleteChannel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
