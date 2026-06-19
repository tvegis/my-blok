import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;

  // Use the actual request origin so it works with any domain/alias
  const { origin } = new URL(request.url);
  const siteUrl = process.env.SITE_URL || origin;

  if (!clientId) {
    return NextResponse.json(
      { error: "OAuth client ID not configured" },
      { status: 500 }
    );
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${siteUrl}/api/auth/callback`,
    scope: "repo,user",
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );
}
