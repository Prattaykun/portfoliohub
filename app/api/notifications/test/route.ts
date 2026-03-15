import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

function configureWebPush() {
  const subject = process.env.WEB_PUSH_SUBJECT;
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || process.env.WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    return null;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return { publicKey };
}

export async function POST(request: NextRequest) {
  try {
    if (!configureWebPush()) {
      return NextResponse.json(
        { error: "Web push is not configured. Set WEB_PUSH_SUBJECT, NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY, and WEB_PUSH_PRIVATE_KEY." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const subscription = body.subscription as PushSubscriptionPayload | undefined;
    const title = typeof body.title === "string" && body.title ? body.title : "PortfolioHub";
    const message = typeof body.body === "string" && body.body ? body.body : "Push notifications are working.";
    const url = typeof body.url === "string" && body.url ? body.url : "/dashboard";

    if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json({ error: "A valid push subscription is required." }, { status: 400 });
    }

    await webpush.sendNotification(
      subscription as webpush.PushSubscription,
      JSON.stringify({
        title,
        body: message,
        url,
        icon: "/pwa-icons/192",
        badge: "/pwa-icons/monochrome-192",
      })
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Push notification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send push notification." },
      { status: 500 }
    );
  }
}