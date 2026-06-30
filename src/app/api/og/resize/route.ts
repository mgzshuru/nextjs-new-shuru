import { NextRequest } from 'next/server';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Define allowed hosts for safety checks
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      'cms.shuru.sa',
      'shuru-bkt.s3.eu-west-3.amazonaws.com',
    ];

    // Read the site URL from environment to allow frontend host requests as well
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl) {
      try {
        const parsedSiteUrl = new URL(siteUrl);
        allowedHosts.push(parsedSiteUrl.hostname);
      } catch (_) {
        // Ignore invalid NEXT_PUBLIC_SITE_URL format
      }
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
    } catch (_) {
      return new Response('Invalid url parameter', { status: 400 });
    }

    const isHostAllowed = allowedHosts.some(
      (host) => parsedUrl.hostname === host || parsedUrl.hostname.endsWith('.' + host)
    );

    if (!isHostAllowed) {
      return new Response('Host not allowed', { status: 403 });
    }

    // Fetch the original image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new Response('Failed to fetch original image', { status: 500 });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Resize and crop to exactly 1200x630 using sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'centre',
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    return new Response(new Uint8Array(optimizedBuffer), {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error resizing OG image:', error);
    return new Response('Error resizing image', { status: 500 });
  }
}
