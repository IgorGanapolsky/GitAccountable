import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  try {
    const inputPath = path.join(__dirname, '../docs/screenshots/dashboard.svg');
    const outputPath = path.join(__dirname, '../docs/screenshots/dashboard.png');
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await sharp(inputPath)
      .resize(800, 450)
      .png()
      .toFile(outputPath);
    
    console.log('Successfully converted dashboard SVG to PNG');
  } catch (error) {
    console.error('Error converting dashboard SVG to PNG:', error);
  }
}

convertSvgToPng();