import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function convertSvgToPng() {
  try {
    const inputPath = path.join(__dirname, '../docs/images/gitaccountable-logo.svg');
    const outputPath = path.join(__dirname, '../docs/images/gitaccountable-logo.png');
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    await sharp(inputPath)
      .resize(180, 180)
      .png()
      .toFile(outputPath);
    
    console.log('Successfully converted SVG to PNG');
  } catch (error) {
    console.error('Error converting SVG to PNG:', error);
  }
}

convertSvgToPng();