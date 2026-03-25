import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, avatar } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, avatar, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, avatar, role',
      [name, email, hashedPassword, avatar, 'student']
    );

    const user = result.rows[0];

    // Ensure Default Groups Exist and Join User
    const defaultGroups = [
      { name: 'UKMLA', shortName: 'UK', color: '220 72% 50%' },
      { name: 'AKT', shortName: 'AK', color: '262 60% 55%' }
    ];

    for (const dg of defaultGroups) {
      // 1. Find or Create Group
      let groupResult = await pool.query('SELECT id FROM groups WHERE name = $1', [dg.name]);
      let groupId;

      if (groupResult.rows.length === 0) {
        const newGroup = await pool.query(
          'INSERT INTO groups (name, short_name, color, description) VALUES ($1, $2, $3, $4) RETURNING id',
          [dg.name, dg.shortName, dg.color, `Official ${dg.name} discussion group.`]
        );
        groupId = newGroup.rows[0].id;

        // 2. Create Default Channels for the new group
        const categories = ['Text Channels', 'Resources', 'Doubts', 'Announcements'];
        for (const cat of categories) {
          const channelName = cat.toLowerCase().replace(' ', '-');
          await pool.query(
            'INSERT INTO channels (group_id, name, category) VALUES ($1, $2, $3)',
            [groupId, channelName, cat]
          );
        }
      } else {
        groupId = groupResult.rows[0].id;
      }

      // 3. Join user to group
      await pool.query(
        'INSERT INTO group_members (user_id, group_id, role) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [user.id, groupId, 'student']
      );
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const result = await pool.query('SELECT id, name, email, avatar, role FROM users WHERE id = $1', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
