import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure the output directory exists
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Convert SVG to PNG
async function convertSvgToPng(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created ${outputPath}`);
  } catch (error) {
    console.error(`Error converting ${inputPath} to PNG:`, error);
  }
}

// Convert icons
async function convertIcons() {
  await convertSvgToPng(
    path.join(iconsDir, 'icon-192x192.svg'),
    path.join(iconsDir, 'icon-192x192.png'),
    192
  );
  
  await convertSvgToPng(
    path.join(iconsDir, 'icon-512x512.svg'),
    path.join(iconsDir, 'icon-512x512.png'),
    512
  );
}

convertIcons();