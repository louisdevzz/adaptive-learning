import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie on the frontend domain so Next.js middleware can read it
    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
