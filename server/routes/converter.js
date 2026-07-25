const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Configure temporary multer storage for single conversion uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

// POST single/multi dropzone conversion to WebP in real-time
router.post('/convert-single', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const saveToLibrary = req.body.saveToLibrary === 'true';

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded for conversion' });
    }

    const originalSize = file.size;
    const originalName = path.parse(file.originalname).name;
    const webpFilename = `${originalName}-${Date.now()}.webp`;
    const outputPath = path.join(__dirname, '../uploads/', webpFilename);

    // Convert using Sharp
    const outputBuffer = await sharp(file.buffer)
      .webp({ quality: 80, effort: 4 })
      .toBuffer();

    const convertedSize = outputBuffer.length;
    const savingsPercent = Math.max(0, Math.round(((originalSize - convertedSize) / originalSize) * 100));

    // Write file to disk
    fs.writeFileSync(outputPath, outputBuffer);
    const url = `/uploads/${webpFilename}`;

    // Optionally save to Media Library database
    let mediaId = null;
    if (saveToLibrary) {
      const savedMedia = await prisma.mediaFile.create({
        data: {
          filename: webpFilename,
          url,
          mimeType: 'image/webp',
          size: convertedSize,
          folder: 'general'
        }
      });
      mediaId = savedMedia.id;
    }

    res.json({
      success: true,
      originalName: file.originalname,
      webpFilename,
      url,
      originalSize,
      convertedSize,
      savingsPercent,
      mediaId
    });
  } catch (err) {
    console.error('Error converting file to WebP:', err);
    res.status(500).json({ error: 'Image conversion failed: ' + err.message });
  }
});

// GET scan existing Media Library for legacy non-WebP image files
router.get('/scan', async (req, res) => {
  try {
    const legacyFiles = await prisma.mediaFile.findMany({
      where: {
        mimeType: { startsWith: 'image/' },
        NOT: { mimeType: 'image/webp' }
      }
    });

    res.json({
      count: legacyFiles.length,
      files: legacyFiles
    });
  } catch (err) {
    console.error('Error scanning library:', err);
    res.status(500).json({ error: 'Failed to scan Media Library for legacy images' });
  }
});

// POST bulk convert legacy images to WebP and update database references in-place
router.post('/bulk-convert', async (req, res) => {
  try {
    const legacyFiles = await prisma.mediaFile.findMany({
      where: {
        mimeType: { startsWith: 'image/' },
        NOT: { mimeType: 'image/webp' }
      }
    });

    let convertedCount = 0;
    let totalBytesSaved = 0;

    for (const media of legacyFiles) {
      try {
        const oldFilename = path.basename(media.url);
        const oldFilePath = path.join(__dirname, '../uploads/', oldFilename);

        if (!fs.existsSync(oldFilePath)) continue; // skip missing physical files

        const newFilename = `${path.parse(oldFilename).name}.webp`;
        const newFilePath = path.join(__dirname, '../uploads/', newFilename);
        const newUrl = `/uploads/${newFilename}`;

        // Convert file on disk
        const statsBefore = fs.statSync(oldFilePath);
        await sharp(oldFilePath)
          .webp({ quality: 80, effort: 4 })
          .toFile(newFilePath);
        
        const statsAfter = fs.statSync(newFilePath);
        totalBytesSaved += Math.max(0, statsBefore.size - statsAfter.size);

        // Update MediaFile record
        await prisma.mediaFile.update({
          where: { id: media.id },
          data: {
            filename: newFilename,
            url: newUrl,
            mimeType: 'image/webp',
            size: statsAfter.size
          }
        });

        // Automatically update references in Products, Banners, Brands, Blogs
        await prisma.productImage.updateMany({
          where: { url: media.url },
          data: { url: newUrl }
        });

        await prisma.banner.updateMany({
          where: { image: media.url },
          data: { image: newUrl }
        });

        await prisma.brand.updateMany({
          where: { logo: media.url },
          data: { logo: newUrl }
        });

        await prisma.blogPost.updateMany({
          where: { coverImage: media.url },
          data: { coverImage: newUrl }
        });

        // Optionally unlink old file to free disk space
        if (oldFilePath !== newFilePath && fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }

        convertedCount++;
      } catch (fileErr) {
        console.warn(`Could not convert image ${media.filename}:`, fileErr.message);
      }
    }

    res.json({
      success: true,
      convertedCount,
      totalBytesSaved,
      message: `Successfully converted ${convertedCount} legacy photos to WebP!`
    });
  } catch (err) {
    console.error('Error during bulk conversion:', err);
    res.status(500).json({ error: 'Bulk WebP conversion failed' });
  }
});

module.exports = router;
