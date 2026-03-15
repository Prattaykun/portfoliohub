// app/api/preview/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSiteUrl } from "@/lib/site";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    // Extract username from the URL query (e.g. /api/preview?username=Prattay)
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    if (username === "testuser") {
        return NextResponse.json({
            title: "Test User's Portfolio | PortfolioHub",
            description: "Test User's portfolio on PortfolioHub",
            image: "https://via.placeholder.com/150",
            url: `http://localhost:3000/${username}`,
        });
    }

    // Step 1: Get auth_user_id from users_usernames
    const { data: usernameData, error: usernameError } = await supabase
      .from("users_usernames")
      .select("auth_user_id")
      .eq("username", username)
      .single();

    if (usernameError || !usernameData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Step 2: Get profile data from user_profiles
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("full_name, photo_url")
      .eq("uid", usernameData.auth_user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Step 3: Build preview metadata card
    const previewData = {
      title: `${profile.full_name || username}'s Portfolio | PortfolioHub`,
      description: `${profile.full_name || username}'s portfolio on PortfolioHub — Explore their projects, skills, and achievements.`,
      image: profile.photo_url || "https://res.cloudinary.com/dckndb9ux/image/upload/v1761344574/Screenshot_2025-10-24_212856_lt4hdq.png",
      url: `${getSiteUrl()}/${username}`,
    };

    return NextResponse.json(previewData);
  } catch (err: any) {
    console.error("Error generating preview:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
