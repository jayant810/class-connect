import { Request, Response } from 'express';
import pool from '../db/index.js';
import path from 'path';
import NodeClam from 'clamscan';

// Initialize ClamAV with error handling
let scanner: any = null;

const initScanner = async () => {
  try {
    scanner = await new NodeClam().init({
      removeInfected: false, 
      quarantineInfected: false,
      scanRecursively: true,
      clamdscan: {
        path: '/usr/bin/clamdscan', // Linux production path
        configHandle: '/etc/clamav/clamd.conf',
        active: true
      },
      preference: 'clamdscan'
    });
    console.log('✅ ClamAV Scanner initialized successfully');
  } catch (err) {
    console.error('⚠️ ClamAV not found or not running. Falling back to simulated scanning for development.');
    scanner = null; // Ensure scanner is null so we use fallback logic
  }
};

initScanner();

export const uploadFile = async (req: any, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const { channelId, isDoubt } = req.body;
  const userId = req.user.id;
  const file = req.file;
  const fileUrl = `/uploads/${file.filename}`;
  
  try {
    const result = await pool.query(
      'INSERT INTO messages (channel_id, sender_id, content, attachment_url, attachment_name, attachment_size, is_doubt, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [channelId, userId, req.body.content || '', fileUrl, file.originalname, `${(file.size / 1024 / 1024).toFixed(2)} MB`, isDoubt === 'true', 'pending']
    );

    const message = result.rows[0];
    const senderResult = await pool.query('SELECT name, avatar, role FROM users WHERE id = $1', [userId]);
    const sender = senderResult.rows[0];

    res.status(201).json({
      ...message,
      userName: sender.name,
      avatar: sender.avatar,
      userRole: sender.role,
      scanStatus: 'processing'
    });

    // Production Async Scan with Fallback
    performAsyncScan(message.id, file.path, file.mimetype);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const performAsyncScan = async (messageId: string, filePath: string, mimetype: string) => {
  try {
    if (scanner) {
      // REAL CLAMAV SCAN
      const { isInfected, viruses } = await scanner.isInfected(filePath);
      if (isInfected) {
        await pool.query(
          "UPDATE messages SET attachment_url = NULL, content = '[FILE BLOCKED: MALWARE DETECTED]', verification_status = 'incorrect' WHERE id = $1",
          [messageId]
        );
        return;
      }
    } else {
      // SIMULATED SCAN (Development fallback)
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // NSFW/Policy Mock check (Replace with real API in production)
    const isNSFW = mimetype.startsWith('image/') && Math.random() < 0.001; 
    
    if (isNSFW) {
      await pool.query(
        "UPDATE messages SET attachment_url = NULL, content = '[FILE BLOCKED: INAPPROPRIATE CONTENT]' WHERE id = $1",
        [messageId]
      );
    } else {
      await pool.query(
        "UPDATE messages SET verification_status = 'none' WHERE id = $1",
        [messageId]
      );
    }
  } catch (err) {
    console.error('Scan process failed:', err);
  }
};
