import { Request, Response } from 'express';
import pool from '../db/index.js';
import path from 'path';
import NodeClam from 'clamscan';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize ClamAV
const clamscan = new NodeClam().init({
  removeInfected: false, 
  quarantineInfected: false,
  scanLog: null,
  debugMode: false,
  fileList: null,
  scanRecursively: true,
  clamdscan: {
    path: '/usr/bin/clamdscan', // Production path
    configHandle: '/etc/clamav/clamd.conf',
    showProgress: true,
    timeout: 60000,
    active: true
  },
  preference: 'clamdscan'
});

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

    // Production Async Scan
    performProductionScan(message.id, file.path, file.mimetype);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const performProductionScan = async (messageId: string, filePath: string, mimetype: string) => {
  try {
    const scanner = await clamscan;
    const { isInfected, viruses } = await scanner.isInfected(filePath);

    if (isInfected) {
      console.warn(`VIRUS DETECTED! Message: ${messageId}, Viruses: ${viruses.join(', ')}`);
      await pool.query(
        "UPDATE messages SET attachment_url = NULL, content = '[FILE BLOCKED: MALWARE DETECTED]', verification_status = 'incorrect' WHERE id = $1",
        [messageId]
      );
    } else {
      // Mock NSFW check for images (would replace with real API like AWS Rekognition or Sightengine)
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
    }
  } catch (err) {
    console.error('ClamAV Scan failed (falling back to manual verification):', err);
    // On failure, we keep status as 'pending' for manual admin review
  }
};
