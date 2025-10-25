import type { Metadata } from "next";

type Params = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/preview?username=${username}`,
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

    // ✅ Use the actual image URL (photo_url) directly — no OG generation
    return {
      title: data.title,
      description: data.description,
      openGraph: {
        title: data.title,
        description: data.description,
        images: [
          {
            url: data.image, // use direct user photo
            width: 800,
            height: 800,
            alt: `${username}'s Profile Picture`
          }
        ],
        url: data.url,
      },
      twitter: {
        card: "summary",
        title: data.title,
        description: data.description,
        images: [data.image],
      },
    };
  } catch (error) {
    console.error("Metadata generation failed:", error);

    // Fallback metadata (still no OG image generation)
    const fallbackTitle = `${username}'s Portfolio | PortfolioHub`;
    const fallbackDescription = `Check out ${username}'s portfolio on PortfolioHub`;
    const fallbackImage = "https://res.cloudinary.com/dckndb9ux/image/upload/v1761344574/Screenshot_2025-10-24_212856_lt4hdq.png";
    const fallbackUrl = `https://portfoliohub-pi.vercel.app/${username}`;

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        images: [
          {
            url: fallbackImage,
            width: 800,
            height: 800,
            alt: `${username}'s Portfolio`
          }
        ],
        url: fallbackUrl,
      },
      twitter: {
        card: "summary",
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
