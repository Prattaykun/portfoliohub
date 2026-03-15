import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const nextUrl = new URL("/share-target", request.url);

  const title = formData.get("title");
  const text = formData.get("text");
  const url = formData.get("url");

  if (typeof title === "string" && title) {
    nextUrl.searchParams.set("title", title);
  }

  if (typeof text === "string" && text) {
    nextUrl.searchParams.set("text", text);
  }

  if (typeof url === "string" && url) {
    nextUrl.searchParams.set("url", url);
  }

  return NextResponse.redirect(nextUrl, 303);
}