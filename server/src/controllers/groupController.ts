import { Request, Response } from 'express';
import pool from '../db/index.js';

export const createGroup = async (req: any, res: Response) => {
  const { name, description, shortName, color } = req.body;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'INSERT INTO groups (name, description, created_by, short_name, color) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, userId, shortName, color]
    );
    const group = result.rows[0];

    // Add creator as owner
    await pool.query(
      'INSERT INTO group_members (user_id, group_id, role) VALUES ($1, $2, $3)',
      [userId, group.id, 'owner']
    );

    // Create default general channel
    await pool.query(
      'INSERT INTO channels (group_id, name) VALUES ($1, $2)',
      [group.id, 'general']
    );

    res.status(201).json(group);
  } catch (error) {
    console.error('CreateGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroups = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT g.*, (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as "memberCount"
       FROM groups g 
       JOIN group_members gm ON g.id = gm.group_id 
       WHERE gm.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetGroups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const joinGroup = async (req: any, res: Response) => {
  const { groupId } = req.body;
  const userId = req.user.id;

  try {
    const groupExists = await pool.query('SELECT * FROM groups WHERE id = $1', [groupId]);
    if (groupExists.rows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const membershipExists = await pool.query(
      'SELECT * FROM group_members WHERE user_id = $1 AND group_id = $2',
      [userId, groupId]
    );
    if (membershipExists.rows.length > 0) {
      return res.status(400).json({ message: 'Already a member' });
    }

    await pool.query(
      'INSERT INTO group_members (user_id, group_id, role) VALUES ($1, $2, $3)',
      [userId, groupId, 'student']
    );

    res.json({ message: 'Joined group successfully' });
  } catch (error) {
    console.error('JoinGroup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getGroupMembers = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.avatar, gm.role, gm.joined_at 
       FROM users u 
       JOIN group_members gm ON u.id = gm.user_id 
       WHERE gm.group_id = $1`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetGroupMembers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
