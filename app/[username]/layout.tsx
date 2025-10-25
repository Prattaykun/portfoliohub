// app/[username]/layout.tsx
import type { Metadata } from "next";

type Params = { params: { username: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/preview?username=${params.username}`,
      { 
        next: { revalidate: 60 },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch user data: ${res.status}`);
    }

    const data = await res.json();

    // If the API returns an error, fall back to default
    if (data.error) {
      throw new Error(data.error);
    }

    return {
      title: data.title,
      description: data.description,
      openGraph: {
        title: data.title,
        description: data.description,
        images: [{ 
          url: data.image, 
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
        images: [data.image],
      },
    };
  } catch (error) {
    console.error('Metadata generation failed:', error);
    
    // Fallback to default metadata if user data fetch fails
    const fallbackTitle = `${params.username}'s Portfolio | PortfolioHub`;
    const fallbackDescription = `Check out ${params.username}'s portfolio on PortfolioHub`;
    const fallbackImage = "https://res.cloudinary.com/dckndb9ux/image/upload/v1761344574/Screenshot_2025-10-24_212856_lt4hdq.png";
    const fallbackUrl = `https://portfoliohub-pi.vercel.app/${params.username}`;

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        images: [{ 
          url: fallbackImage, 
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
        images: [fallbackImage],
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