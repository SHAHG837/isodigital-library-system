import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    const url = await QRCode.toDataURL(text, {
      width: 250,
      margin: 2,
      color: {
        dark: '#065F46', // Emerald green
        light: '#FFFFFF'
      }
    });
    return url;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return '';
  }
}

// Synchronous SVG Data URL generator for instant React rendering
export function generateQRCodeDataURL(text: string): string {
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=065f46&data=${encoded}`;
}
