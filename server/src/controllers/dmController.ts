import { Request, Response } from 'express';
import pool from '../db/index.js';
import { extractLinks, fetchLinkMetadata } from '../utils/linkPreview.js';

export const getDMFeed = async (req: any, res: Response) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(`
      SELECT DISTINCT
        u.id, u.name, u.avatar
      FROM users u
      JOIN direct_messages dm ON (dm.sender_id = u.id AND dm.receiver_id = $1)
                              OR (dm.receiver_id = u.id AND dm.sender_id = $1)
      WHERE u.id != $1
    `, [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('GetDMFeed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDMsWithUser = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { otherUserId } = req.params;

  try {
    const result = await pool.query(`
      SELECT dm.*, u.name as "userName", u.avatar, u.role as "userRole"
      FROM direct_messages dm
      JOIN users u ON u.id = dm.sender_id
      WHERE (dm.sender_id = $1 AND dm.receiver_id = $2)
         OR (dm.sender_id = $2 AND dm.receiver_id = $1)
      ORDER BY dm.created_at ASC
    `, [userId, otherUserId]);
    res.json(result.rows);
  } catch (error) {
    console.error('GetDMsWithUser error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const sendDM = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { receiverId, content, attachment_url, attachment_name, attachment_size } = req.body;

  try {
    // Process link previews
    const links = extractLinks(content || '');
    let linkMetadata = null;
    if (links.length > 0) {
      console.log('Extracted DM links:', links);
      const metadata = await fetchLinkMetadata(links[0]);
      if (metadata) {
        console.log('Fetched DM metadata:', metadata);
        linkMetadata = metadata;
      }
    }

    const result = await pool.query(`
      INSERT INTO direct_messages (sender_id, receiver_id, content, attachment_url, attachment_name, attachment_size, link_metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [userId, receiverId, content || '', attachment_url || null, attachment_name || null, attachment_size || null, linkMetadata]);
    
    const message = result.rows[0];
    const senderResult = await pool.query('SELECT name, avatar, role FROM users WHERE id = $1', [userId]);
    const sender = senderResult.rows[0];

    res.status(201).json({
      ...message,
      userName: sender.name,
      avatar: sender.avatar,
      userRole: sender.role
    });
  } catch (error) {
    console.error('SendDM error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
