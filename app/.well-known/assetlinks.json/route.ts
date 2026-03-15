import { NextResponse } from "next/server";

import { splitFingerprints } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET() {
  const packageId = process.env.ANDROID_APP_PACKAGE_ID;
  const fingerprints = splitFingerprints(process.env.ANDROID_SHA256_FINGERPRINTS);

  if (!packageId || fingerprints.length === 0) {
    return NextResponse.json([], {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: packageId,
          sha256_cert_fingerprints: fingerprints,
        },
      },
    ],
    {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    }
  );
}