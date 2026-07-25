const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = require('../prismaClient');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File validation - allow images, videos, documents, data feeds, and backups
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf', 'text/csv', 'text/xml', 'application/xml',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel',
    'application/zip', 'application/x-zip-compressed', 'application/octet-stream', 'application/sql'
  ];
  if (allowedMimeTypes.includes(file.mimetype) || file.originalname.endsWith('.sql') || file.originalname.endsWith('.db') || file.originalname.endsWith('.csv') || file.originalname.endsWith('.xml') || file.originalname.endsWith('.xlsx')) {
    cb(null, true);
  } else {
    // Fallback allow for general media library uploads unless explicit dangerous extension
    if (file.originalname.match(/\.(exe|bat|sh|cmd|js)$/i)) {
      return cb(new Error('Invalid file type.'), false);
    }
    cb(null, true);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for video banners & backups
  fileFilter: fileFilter 
});

// Single file upload route
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const folder = req.body.folder || req.query.folder || 'general';
    
    // Save to MediaFile database table
    const media = await prisma.mediaFile.create({
      data: {
        filename: req.file.filename,
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folder: folder
      }
    });

    res.json({ message: 'File uploaded successfully', url: fileUrl, media });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

module.exports = router;
