// app/[username]/layout.tsx
import type { Metadata } from "next";
import { getCldOgImageUrl } from 'next-cloudinary';

type Params = { params: { username: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/preview?username=${params.username}`,
      { 
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch user data: ${res.status}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Generate dynamic Cloudinary OG image
    const ogImageUrl = getCldOgImageUrl({
      src: data.image || 'portfoliohub/default-og-image',
      effects: [{ colorize: '100,co_white' }],
      overlays: [
        {
          publicId: data.image || 'portfoliohub/default-og-image',
          position: {
            gravity: 'north_east',
          },
          effects: [
            {
              crop: 'fill',
              gravity: 'auto',
              width: '0.33',
              height: '1.0'
            }
          ],
          flags: ['relative']
        },
        {
          width: 625,
          crop: 'fit',
          text: {
            color: 'black',
            fontFamily: 'Source Sans Pro',
            fontSize: 80,
            fontWeight: 'bold',
            text: data.title?.split('|')[0]?.trim() || `${params.username}'s Portfolio`
          },
          position: {
            x: 125,
            y: -50,
            gravity: 'west',
          },
        },
        {
          width: 625,
          crop: 'fit',
          text: {
            color: 'black',
            fontFamily: 'Source Sans Pro',
            fontSize: 37,
            text: data.description || 'Check out my portfolio on PortfolioHub'
          },
          position: {
            x: 125,
            y: 50,
            gravity: 'west',
          },
        },
      ]
    });

    return {
      title: data.title,
      description: data.description,
      openGraph: {
        title: data.title,
        description: data.description,
        images: [{ 
          url: ogImageUrl, 
          width: 1200, 
          height: 630, 
          alt: data.title 
        }],
        url: data.url,
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Metadata generation failed:', error);
    
    // Fallback with Cloudinary OG image
    const fallbackTitle = `${params.username}'s Portfolio | PortfolioHub`;
    const fallbackDescription = `Check out ${params.username}'s portfolio on PortfolioHub`;
    const fallbackUrl = `https://portfoliohub-pi.vercel.app/${params.username}`;
    
    // Generate fallback Cloudinary OG image
    const fallbackOgImageUrl = getCldOgImageUrl({
      src: 'portfoliohub/default-og-image',
      effects: [{ colorize: '100,co_white' }],
      overlays: [
        {
          publicId: 'portfoliohub/default-og-image',
          position: {
            gravity: 'north_east',
          },
          effects: [
            {
              crop: 'fill',
              gravity: 'auto',
              width: '0.33',
              height: '1.0'
            }
          ],
          flags: ['relative']
        },
        {
          width: 625,
          crop: 'fit',
          text: {
            color: 'black',
            fontFamily: 'Source Sans Pro',
            fontSize: 80,
            fontWeight: 'bold',
            text: `${params.username}'s Portfolio`
          },
          position: {
            x: 125,
            y: -50,
            gravity: 'west',
          },
        },
        {
          width: 625,
          crop: 'fit',
          text: {
            color: 'black',
            fontFamily: 'Source Sans Pro',
            fontSize: 37,
            text: 'Portfolio on PortfolioHub'
          },
          position: {
            x: 125,
            y: 50,
            gravity: 'west',
          },
        },
      ]
    });

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        images: [{ 
          url: fallbackOgImageUrl, 
          width: 1200, 
          height: 630, 
          alt: fallbackTitle
        }],
        url: fallbackUrl,
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
        images: [fallbackOgImageUrl],
      },
    };
  }
}

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}