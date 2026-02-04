import type { Metadata } from "next";

type Params = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { username } = await params;

  try {
    if (!process.env.NEXT_PUBLIC_SITE_URL) {
      throw new Error("NEXT_PUBLIC_SITE_URL is not defined");
    }

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
        url: data.url,
      },
      twitter: {
        card: "summary_large_image",
        title: data.title,
        description: data.description,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Suppress stack trace for expected 404s (user not found) to avoid console noise
    if (errorMessage.includes("404")) {
       console.warn(`[Metadata] User not found: ${username} (404)`);
    } else {
       console.error("Metadata generation failed:", error);
    }

    // Fallback metadata (still no OG image generation)
    const fallbackTitle = `${username}'s Portfolio | PortfolioHub`;
    const fallbackDescription = `Check out ${username}'s portfolio on PortfolioHub`;
    const fallbackUrl = `https://portfoliohub-pi.vercel.app/${username}`;

    return {
      title: fallbackTitle,
      description: fallbackDescription,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDescription,
        url: fallbackUrl,
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDescription,
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
