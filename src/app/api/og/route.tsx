import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';
import fs from 'fs';
import path from 'path';

// Cache fonts in memory to avoid fetching them on every request
let interRegular: ArrayBuffer | null = null;
let interBold: ArrayBuffer | null = null;
let cairoRegular: ArrayBuffer | null = null;
let cairoBold: ArrayBuffer | null = null;

async function getFonts(): Promise<{
  interRegular: ArrayBuffer;
  interBold: ArrayBuffer;
  cairoRegular: ArrayBuffer;
  cairoBold: ArrayBuffer;
}> {
  if (!interRegular) {
    interRegular = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf').then(res => res.arrayBuffer());
  }
  if (!interBold) {
    interBold = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf').then(res => res.arrayBuffer());
  }
  if (!cairoRegular) {
    cairoRegular = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/cairo@latest/arabic-400-normal.ttf').then(res => res.arrayBuffer());
  }
  if (!cairoBold) {
    cairoBold = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/cairo@latest/arabic-700-normal.ttf').then(res => res.arrayBuffer());
  }
  return {
    interRegular: interRegular!,
    interBold: interBold!,
    cairoRegular: cairoRegular!,
    cairoBold: cairoBold!,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Dynamic Branded Card Mode (using next/og ImageResponse)
    const title = searchParams.get('title') || 'Shuru';
    const description = searchParams.get('description') || '';
    const locale = searchParams.get('locale') || 'ar';
    const isAr = locale === 'ar';

    // Load local brand logo image as base64 (dark horizontal text layout logo for light bg)
    let localLogoBase64: string | null = null;
    try {
      const logoPath = path.join(process.cwd(), 'public', 'شعار بدون خلفية-04.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        localLogoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (e) {
      console.error('Failed to load local brand logo:', e);
    }

    // Satori doesn't support automatic RTL word layout reordering. We reverse the order of word tokens for Arabic.
    const formatArabicText = (text: string) => {
      if (!text) return '';
      return text.split(' ').reverse().join(' ');
    };

    const displayTitle = isAr ? formatArabicText(title) : title;
    const displayDescription = isAr ? formatArabicText(description) : description;

    // Fetch Cairo/Inter fonts
    const fonts = await getFonts();

    return new ImageResponse(
      (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            width: '1200px',
            height: '630px',
            backgroundColor: '#f6f6f6', // Light background oklch(0.9642 0 0) matching globals.css :root
            fontFamily: isAr ? 'Cairo' : 'Inter',
            overflow: 'hidden',
          }}
        >
          {/* Top-Right Cyan/Teal Radial Glow - oklch(0.52 0.0946 191.5521) */}
          <div
            style={{
              position: 'absolute',
              top: '-150px',
              right: '-150px',
              width: '700px',
              height: '700px',
              borderRadius: '350px',
              background: 'radial-gradient(#14b8a614 0%, #14b8a600 70%)',
            }}
          />

          {/* Bottom-Left Violet Radial Glow */}
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '-150px',
              width: '700px',
              height: '700px',
              borderRadius: '350px',
              background: 'radial-gradient(#8b5cf60d 0%, #8b5cf600 70%)',
            }}
          />

          {/* Inner border overlay - matches oklch(0.8860 0.0069 277.1521) / #e2e8f0 */}
          <div
            style={{
              position: 'absolute',
              inset: '24px',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
            }}
          />

          {/* Decorative Horizontal Architectural Line using native SVG to bypass Satori parser */}
          <svg
            width="1152px"
            height="1px"
            style={{
              position: 'absolute',
              top: '155px',
              left: '24px',
            }}
          >
            <defs>
              <linearGradient id="horizontal-fade" x1={isAr ? "1" : "0"} y1="0" x2={isAr ? "0" : "1"} y2="0">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="1152" y2="0" stroke="url(#horizontal-fade)" strokeWidth="1" />
          </svg>

          {/* Decorative Vertical Architectural Line using native SVG */}
          <svg
            width="1px"
            height="582px"
            style={{
              position: 'absolute',
              top: '24px',
              ...(isAr ? { right: '310px' } : { left: '310px' }),
            }}
          >
            <defs>
              <linearGradient id="vertical-fade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line x1="0" y1="0" x2="0" y2="582" stroke="url(#vertical-fade)" strokeWidth="1" />
          </svg>

          {/* Crosshair at intersection */}
          <div
            style={{
              position: 'absolute',
              top: '151px',
              width: '9px',
              height: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ...(isAr ? { right: '306px' } : { left: '306px' }),
            }}
          >
            <div style={{ position: 'absolute', width: '9px', height: '1px', backgroundColor: '#14b8a64d' }} />
            <div style={{ position: 'absolute', width: '1px', height: '9px', backgroundColor: '#14b8a64d' }} />
          </div>

          {/* Main Layout Container */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              width: '100%',
              height: '100%',
              padding: '70px 80px',
              alignItems: isAr ? 'flex-end' : 'flex-start',
            }}
          >
            {/* Header: Logo and site name */}
            <div
              style={{
                display: 'flex',
                flexDirection: isAr ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: '16px',
                alignSelf: isAr ? 'flex-end' : 'flex-start',
              }}
            >
              {localLogoBase64 ? (
                <img
                  src={localLogoBase64}
                  alt="Logo"
                  style={{
                    height: '56px',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: isAr ? 'row-reverse' : 'row',
                    alignItems: 'center',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '16px',
                      backgroundColor: '#0ea5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <div style={{ width: '12px', height: '12px', borderRadius: '6px', backgroundColor: '#ffffff' }} />
                  </div>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 700,
                      color: '#ffffff',
                      letterSpacing: isAr ? '0px' : '1px',
                    }}
                  >
                    {isAr ? 'شورى' : 'Shuru'}
                  </span>
                </div>
              )}
            </div>

            {/* Body: Title and Description */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isAr ? 'flex-end' : 'flex-start',
                width: '100%',
                margin: 'auto 0',
              }}
            >
              <h1
                style={{
                  fontSize: '56px',
                  fontWeight: 700,
                  color: '#0d111d', // Deep dark navy matching globals.css foreground
                  margin: '0 0 20px 0',
                  lineHeight: 1.25,
                  textAlign: isAr ? 'right' : 'left',
                }}
              >
                {displayTitle}
              </h1>
              {description ? (
                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: 400,
                    color: '#334155', // Muted slate color for high readability in light theme
                    margin: '0',
                    lineHeight: 1.5,
                    maxWidth: '900px',
                    textAlign: isAr ? 'right' : 'left',
                  }}
                >
                  {displayDescription}
                </p>
              ) : null}
            </div>

            {/* Footer */}
            <div
              style={{
                display: 'flex',
                flexDirection: isAr ? 'row-reverse' : 'row',
                alignItems: 'center',
                gap: '8px',
                alignSelf: isAr ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{ width: '16px', height: '2px', backgroundColor: '#14b8a6' }} />
              <span
                style={{
                  fontSize: '18px',
                  color: '#475569', // Dark grey footer text
                  fontWeight: 500,
                }}
              >
                shuru.sa
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: fonts.interRegular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Inter',
            data: fonts.interBold,
            weight: 700,
            style: 'normal',
          },
          {
            name: 'Cairo',
            data: fonts.cairoRegular,
            weight: 400,
            style: 'normal',
          },
          {
            name: 'Cairo',
            data: fonts.cairoBold,
            weight: 700,
            style: 'normal',
          },
        ],
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
