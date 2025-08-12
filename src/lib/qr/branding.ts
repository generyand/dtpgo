import sharp from 'sharp';
import path from 'path';
import { generateQRCodeDataURL } from './generator';

interface StudentInfo {
  name: string;
  studentId: string;
}

export async function createBrandedQRCode(studentInfo: StudentInfo): Promise<Buffer> {
  try {
    const qrCodeDataUrl = await generateQRCodeDataURL(studentInfo.studentId, {
      width: 200,
      margin: 1,
    });
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

    const logoPath = path.join(process.cwd(), 'public/next.svg');
    const logoBuffer = await sharp(logoPath).resize(50, 50).toBuffer();

    const canvas = sharp({
      create: {
        width: 300,
        height: 400,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    const textSvg = `
      <svg width="300" height="100">
        <style>
          .title { fill: #333; font-size: 20px; font-family: Arial, sans-serif; text-align: center; }
          .subtitle { fill: #666; font-size: 16px; font-family: Arial, sans-serif; text-align: center; }
        </style>
        <text x="150" y="40" text-anchor="middle" class="title">${studentInfo.name}</text>
        <text x="150" y="70" text-anchor="middle" class="subtitle">${studentInfo.studentId}</text>
      </svg>
    `;

    return canvas
      .composite([
        { input: logoBuffer, top: 20, left: 125 },
        { input: Buffer.from(textSvg), top: 80, left: 0 },
        { input: qrCodeBuffer, top: 180, left: 50 },
      ])
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Error creating branded QR code:', error);
    throw new Error('Failed to create branded QR code.');
  }
} 