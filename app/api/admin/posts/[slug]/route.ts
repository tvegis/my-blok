import { NextResponse } from "next/server";

const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
const OWNER = "tvegis";
const REPO = "my-blog";
const POSTS_PATH = "content/posts";
const API = "https://api.github.com";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function getHeaders() {
  if (!GITHUB_TOKEN) return null;
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "my-blog-admin",
  };
}

function parseFrontmatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { title: "Untitled", date: "", description: "", tags: [], draft: false, body: raw };

  const fm: Record<string, any> = {};
  for (const line of match[1].split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let val: any = line.slice(colonIdx + 1).trim();
    if (val.startsWith("[") && val.endsWith("]")) {
      try { val = JSON.parse(val.replace(/'/g, '"')); } catch { val = []; }
    } else if (val === "true") val = true;
    else if (val === "false") val = false;
    fm[key] = val;
  }

  return {
    title: fm.title || "Untitled",
    date: fm.date || "",
    description: fm.description || "",
    tags: fm.tags || [],
    draft: fm.draft ?? false,
    body: match[2].trim(),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const pw = _request.headers.get("x-admin-auth");
  if (pw !== process.env.ADMIN_PASSWORD) return unauthorized();

  const headers = getHeaders();
  if (!headers)
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });

  const { slug } = await params;
  const url = `${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(`${POSTS_PATH}/${slug}.mdx`)}`;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: `GitHub API error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const decoded = Buffer.from(data.content, "base64").toString("utf-8");
    const post = parseFrontmatter(decoded);

    return NextResponse.json({
      slug,
      sha: data.sha,
      ...post,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const pw = _request.headers.get("x-admin-auth");
  if (pw !== process.env.ADMIN_PASSWORD) return unauthorized();

  const headers = getHeaders();
  if (!headers)
    return NextResponse.json({ error: "GitHub token not configured" }, { status: 500 });

  const { slug } = await params;
  const path = `${POSTS_PATH}/${slug}.mdx`;

  try {
    // Get SHA first
    const url = `${API}/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
    const existRes = await fetch(url, { headers });
    if (!existRes.ok) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    const existData = await existRes.json();

    // Delete
    const delRes = await fetch(url, {
      method: "DELETE",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Delete ${slug}.mdx`,
        sha: existData.sha,
        branch: "main",
      }),
    });

    if (!delRes.ok) {
      return NextResponse.json(
        { error: `GitHub API error: ${delRes.status}` },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, slug });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete post" },
      { status: 500 }
    );
  }
}
