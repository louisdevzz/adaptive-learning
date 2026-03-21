import { NextResponse } from "next/server";

const REMEMBER_ME_MAX_AGE_DAYS = 7;
const STANDARD_MAX_AGE_DAYS = 1;

export async function POST(request: Request) {
  try {
    const { accessToken, rememberMe } = await request.json();

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const maxAgeDays = rememberMe ? REMEMBER_ME_MAX_AGE_DAYS : STANDARD_MAX_AGE_DAYS;

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie on the frontend domain so Next.js middleware can read it
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: maxAgeDays * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[set-cookie] Failed to set cookie:", error);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
