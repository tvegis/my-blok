import { NextResponse } from "next/server";

function getCallbackHTML(token: string, error?: string) {
  if (error) {
    return `<!DOCTYPE html>
<html><body><script>
  window.opener.postMessage({ error: "${error}" }, "*");
  window.close();
</script></body></html>`;
  }

  return `<!DOCTYPE html>
<html><body><script>
  (function() {
    // Immediately post the token back to the opener (admin page).
    // The admin page's message listener stores it in localStorage
    // and then initializes the CMS.
    window.opener.postMessage(
      'authorization:github:success:{"token":"${token}","provider":"github"}',
      '*'
    );
    window.close();
  })();
</script></body></html>`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return new Response(
      getCallbackHTML("", error || "No authorization code received"),
      { headers: { "Content-Type": "text/html" }, status: 400 }
    );
  }

  const clientId = process.env.OAUTH_GITHUB_CLIENT_ID;
  const clientSecret = process.env.OAUTH_GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response(
      getCallbackHTML("", "Server OAuth configuration missing"),
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
        }),
      }
    );

    const data = await tokenResponse.json();

    if (data.error) {
      return new Response(
        getCallbackHTML("", data.error_description || data.error),
        { headers: { "Content-Type": "text/html" }, status: 400 }
      );
    }

    return new Response(getCallbackHTML(data.access_token), {
      headers: { "Content-Type": "text/html" },
    });
  } catch (err) {
    return new Response(
      getCallbackHTML("", "Failed to exchange token"),
      { headers: { "Content-Type": "text/html" }, status: 500 }
    );
  }
}
