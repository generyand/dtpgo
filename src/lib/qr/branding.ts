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

    // Use DTP logo instead of next.svg
    const logoPath = path.join(process.cwd(), 'public/logo/dtp.png');
    const logoBuffer = await sharp(logoPath)
      .resize(60, 60)
      .png()
      .toBuffer();

    const canvas = sharp({
      create: {
        width: 300,
        height: 420,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    });

    // Enhanced branding with DTP colors and styling
    const textSvg = `
      <svg width="300" height="120">
        <defs>
          <linearGradient id="dtpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#D97706;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1" />
          </linearGradient>
        </defs>
        <style>
          .dtp-title { fill: #1F2937; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold; }
          .student-name { fill: #374151; font-size: 18px; font-family: Arial, sans-serif; font-weight: bold; }
          .student-id { fill: #6B7280; font-size: 14px; font-family: Arial, sans-serif; }
          .separator { stroke: url(#dtpGradient); stroke-width: 2; }
        </style>
        <text x="150" y="20" text-anchor="middle" class="dtp-title">Department of Technical Programs</text>
        <text x="150" y="35" text-anchor="middle" class="dtp-title">UM Digos College</text>
        <line x1="50" y1="45" x2="250" y2="45" class="separator" />
        <text x="150" y="70" text-anchor="middle" class="student-name">${studentInfo.name}</text>
        <text x="150" y="90" text-anchor="middle" class="student-id">ID: ${studentInfo.studentId}</text>
      </svg>
    `;

    return canvas
      .composite([
        { input: logoBuffer, top: 15, left: 120 }, // DTP logo at top
        { input: Buffer.from(textSvg), top: 85, left: 0 }, // Text below logo
        { input: qrCodeBuffer, top: 210, left: 50 }, // QR code at bottom
      ])
      .png()
      .toBuffer();
  } catch (error) {
    console.error('Error creating branded QR code:', error);
    throw new Error('Failed to create branded QR code.');
  }
} 