const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../resources/logo.svg');
const outputDir = path.join(__dirname, '../resources');
const iconPath = path.join(outputDir, 'icon.png');
const icoPath = path.join(outputDir, 'icon.ico');

async function generateIcons() {
    try {
        console.log('Generating icons from SVG...');

        // Generate 512x512 PNG
        await sharp(svgPath)
            .resize(512, 512)
            .png()
            .toFile(iconPath);
        console.log(`Generated: ${iconPath}`);

        // Generate ICO (requires multiple sizes usually, but for now just resizing to 256x256 for basic ICO)
        // Note: sharp doesn't natively support .ico output directly in all versions, 
        // but we can save as PNG and rename or use a specific ico library. 
        // However, electron-builder often handles .png or .ico. 
        // Let's try to generate a 256x256 PNG and name it icon.ico if sharp allows, 
        // or just rely on the PNG for electron-builder which can auto-convert.

        // Actually, electron-builder prefers a 512x512 png named 'icon.png' in build resources.
        // It also likes 'icon.ico' for Windows.
        // Since sharp can't write ICO directly without plugins, we'll stick to PNG.
        // Electron-builder can create the ICO from the PNG if configured, or we can use a simple buffer trick if needed.
        // For now, let's just ensure we have a high-res PNG.

        console.log('Icon generation complete.');
    } catch (error) {
        console.error('Error generating icons:', error);
        process.exit(1);
    }
}

generateIcons();
