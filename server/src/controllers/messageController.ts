import { Request, Response } from 'express';
import pool from '../db/index.js';
import { extractLinks, fetchLinkMetadata } from '../utils/linkPreview.js';

export const createMessage = async (req: any, res: Response) => {
  const { channelId, content, attachmentUrl, attachmentName, attachmentSize, isDoubt } = req.body;
  const userId = req.user.id;

  try {
    // Process link previews
    const links = extractLinks(content || '');
    let linkMetadata = null;
    if (links.length > 0) {
      console.log('Extracted links:', links);
      // Just take the first link for now to avoid overloading
      const metadata = await fetchLinkMetadata(links[0]);
      if (metadata) {
        console.log('Fetched metadata:', metadata);
        linkMetadata = metadata; // node-postgres handles objects for jsonb
      }
    }

    const result = await pool.query(
      'INSERT INTO messages (channel_id, sender_id, content, attachment_url, attachment_name, attachment_size, is_doubt, verification_status, link_metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [channelId, userId, content, attachmentUrl, attachmentName, attachmentSize, isDoubt || false, isDoubt ? 'pending' : 'none', linkMetadata]
    );

    const message = result.rows[0];
    
    // Fetch sender info to return with message
    const senderResult = await pool.query('SELECT name, avatar, role FROM users WHERE id = $1', [userId]);
    const sender = senderResult.rows[0];

    res.status(201).json({
      ...message,
      userName: sender.name,
      avatar: sender.avatar,
      userRole: sender.role
    });
  } catch (error) {
    console.error('CreateMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { channelId } = req.params;

  try {
    const result = await pool.query(
      `SELECT m.*, u.name as "userName", u.avatar, u.role as "userRole" 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.channel_id = $1 
       ORDER BY m.created_at ASC`,
      [channelId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const verifyMessage = async (req: any, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'verified' or 'incorrect'
  const userId = req.user.id;

  try {
    // Check if user is mentor or admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
    const userRole = userResult.rows[0].role;

    if (userRole !== 'mentor' && userRole !== 'admin') {
      return res.status(403).json({ message: 'Only mentors or admins can verify messages' });
    }

    const result = await pool.query(
      'UPDATE messages SET verification_status = $1, verified_by = $2 WHERE id = $3 RETURNING *',
      [status, userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('VerifyMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const flagMessage = async (req: any, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'UPDATE messages SET verification_status = $1 WHERE id = $2 AND verification_status = $3 RETURNING *',
      ['pending', id, 'none']
    );

    if (result.rows.length === 0) {
      // If already pending/verified/incorrect, just return the current message
      const current = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
      return res.json(current.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('FlagMessage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
