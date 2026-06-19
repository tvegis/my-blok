"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

type Page = "login" | "list" | "editor";

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
  cover?: string;
}

interface PostFile {
  name: string;
  sha: string;
  path: string;
}

interface GitHubContent {
  name: string;
  path: string;
  sha: string;
  content?: string;
  encoding?: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const GH_OWNER = "tvegis";
const GH_REPO = "my-blog";
const GH_BRANCH = "main";
const POSTS_DIR = "content/posts";
const TOKEN_KEY = "decap-cms-github-token"; // reuse existing key

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Unicode-safe base64 encode (for GitHub API content) */
function b64Encode(str: string): string {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))));
}

/** Unicode-safe base64 decode */
function b64Decode(str: string): string {
  return decodeURIComponent([...atob(str)].map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""));
}

function ghApi(path: string, token: string, init?: RequestInit) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "my-blog-admin",
      ...init?.headers,
    },
  });
}

/** Parse frontmatter + body from an MDX string */
function parseMdx(raw: string): { frontmatter: Record<string, unknown>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const fm: Record<string, unknown> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const val = line.slice(sep + 1).trim();
    if (val === "true") fm[key] = true;
    else if (val === "false") fm[key] = false;
    else if (!isNaN(Number(val))) fm[key] = Number(val);
    else if (val.startsWith("[") && val.endsWith("]")) {
      fm[key] = val.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else fm[key] = val.replace(/^["']|["']$/g, "");
  }
  return { frontmatter: fm, body: match[2].trim() };
}

/** Build an MDX string from frontmatter + body */
function buildMdx(fm: Record<string, unknown>, body: string): string {
  const lines = ["---"];
  for (const [k, v] of Object.entries(fm)) {
    if (Array.isArray(v)) lines.push(`${k}: [${v.map((s) => `"${s}"`).join(", ")}]`);
    else if (typeof v === "boolean") lines.push(`${k}: ${v}`);
    else lines.push(`${k}: "${v}"`);
  }
  lines.push("---", "", body);
  return lines.join("\n");
}

/** Extract slug from file path */
function pathToSlug(path: string): string {
  return path.replace(/^.*\//, "").replace(/\.mdx$/, "");
}

/** Date string → <input type="date"> value */
function toDateInput(d: string): string {
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

/** Get the raw file content from the GitHub API */
async function fetchFileContent(path: string, token: string): Promise<{ content: string; sha: string } | null> {
  const res = await ghApi(`/repos/${GH_OWNER}/${GH_REPO}/contents/${path}?ref=${GH_BRANCH}`, token);
  if (!res.ok) return null;
  const data: GitHubContent = await res.json();
  if (data.content && data.encoding === "base64") {
    return { content: b64Decode(data.content), sha: data.sha };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function LoginPage({ onToken }: { onToken: (t: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (typeof e.data !== "string" || !e.data.includes("authorization:github:success")) return;
      try {
        const token = JSON.parse(e.data.replace("authorization:github:success:", "")).token;
        localStorage.setItem(TOKEN_KEY, token);
        onToken(token);
      } catch { /* ignore */ }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [onToken]);

  const login = () => {
    setBusy(true);
    setError("");
    const popup = window.open("/api/auth", "login", "width=600,height=680");
    if (!popup) {
      setError("弹窗被浏览器拦截了，请允许本网站弹出窗口");
      setBusy(false);
    }
    setTimeout(() => setBusy(false), 10000);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a14]">
      <div className="w-full max-w-sm text-center px-6">
        <h1 className="text-2xl font-bold text-white mb-2">博客管理后台</h1>
        <p className="text-zinc-400 text-sm mb-8">使用 GitHub 登录以管理文章</p>
        <button
          onClick={login}
          disabled={busy}
          className="w-full rounded-lg bg-[#2d2d5e] px-6 py-3 text-white font-medium
                     hover:bg-[#3d3d7e] disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors"
        >
          {busy ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              登录中...
            </span>
          ) : (
            "Login with GitHub"
          )}
        </button>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PostList({
  posts,
  onEdit,
  onNew,
  onLogout,
}: {
  posts: PostFile[];
  onEdit: (slug: string) => void;
  onNew: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0a0a14]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <h1 className="text-lg font-bold text-white">文章管理</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onNew}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
                         hover:bg-blue-500 transition-colors"
            >
              ＋ 新建文章
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400
                         hover:text-white hover:border-zinc-500 transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {posts.length === 0 ? (
          <div className="mt-20 text-center text-zinc-500">
            <p className="text-lg">还没有文章</p>
            <button onClick={onNew} className="mt-4 text-blue-400 hover:text-blue-300">
              创建第一篇 →
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {posts.map((file) => (
              <PostCard key={file.name} file={file} onEdit={onEdit} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function PostCard({ file, onEdit }: { file: PostFile; onEdit: (s: string) => void }) {
  const slug = pathToSlug(file.name);
  return (
    <button
      onClick={() => onEdit(slug)}
      className="group flex items-center justify-between rounded-xl border border-zinc-800
                 bg-zinc-900/50 px-6 py-4 text-left hover:bg-zinc-800/50
                 hover:border-zinc-700 transition-all"
    >
      <div className="flex items-center gap-3 min-w-0">
        <svg className="h-5 w-5 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="truncate font-medium text-zinc-200 group-hover:text-white transition-colors">
          {slug}
        </span>
      </div>
      <svg className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */

function PostEditor({
  slug,
  onBack,
  token,
}: {
  slug: string | null;
  onBack: () => void;
  token: string;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(toDateInput(new Date().toISOString()));
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [draft, setDraft] = useState(false);
  const [body, setBody] = useState("");
  const [sha, setSha] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const previewRef = useRef<HTMLDivElement>(null);
  const [markedLoaded, setMarkedLoaded] = useState(false);

  // Load marked library
  useEffect(() => {
    if (typeof (window as any).marked !== "undefined") {
      setMarkedLoaded(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/marked@15/marked.min.js";
    s.onload = () => setMarkedLoaded(true);
    document.head.appendChild(s);
  }, []);

  // Load post content
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetchFileContent(`${POSTS_DIR}/${slug}.mdx`, token)
      .then((data) => {
        if (!data) {
          setError("文件读取失败");
          setLoading(false);
          return;
        }
        const { frontmatter, body: rawBody } = parseMdx(data.content);
        setTitle((frontmatter.title as string) || "");
        setDate(toDateInput((frontmatter.date as string) || ""));
        setDescription((frontmatter.description as string) || "");
        setTagsStr((frontmatter.tags as string[])?.join(", ") || "");
        setDraft((frontmatter.draft as boolean) || false);
        setBody(rawBody);
        setSha(data.sha);
        setLoading(false);
      })
      .catch(() => {
        setError("加载失败");
        setLoading(false);
      });
  }, [slug, token]);

  // Preview rendering
  useEffect(() => {
    if (!previewRef.current || !markedLoaded) return;
    try {
      previewRef.current.innerHTML = (window as any).marked.parse(body || "*无内容*");
    } catch {
      previewRef.current.innerHTML = "*渲染失败*";
    }
  }, [body, markedLoaded]);

  const save = async () => {
    if (!title.trim()) { setError("请输入标题"); return; }
    setSaving(true);
    setError("");
    setSuccess("");

    const fm: Record<string, unknown> = {
      title: title.trim(),
      date,
      description: description.trim(),
      tags: tagsStr.split(",").map((s) => s.trim()).filter(Boolean),
      draft,
    };
    if (!slug || !slug.startsWith("new-")) {
      // Only keep cover when editing existing
    }
    const content = buildMdx(fm, body);

    const postPath = slug
      ? `${POSTS_DIR}/${slug}.mdx`
      : `${POSTS_DIR}/${title.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.mdx`;

    try {
      // Also need to handle cover image if present
      let currentSha = sha;
      if (!currentSha) {
        // Check if file already exists
        const existing = await fetchFileContent(postPath, token);
        if (existing) currentSha = existing.sha;
      }

      const payload: Record<string, unknown> = {
        message: `Update ${postPath}`,
        content: b64Encode(content),
        branch: GH_BRANCH,
      };
      if (currentSha) payload.sha = currentSha;

      const res = await ghApi(`/repos/${GH_OWNER}/${GH_REPO}/contents/${postPath}`, token, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as any).message || `保存失败 (${res.status})`);
      }

      setSuccess("✅ 已保存并提交到 GitHub，Vercel 将自动部署");
      setSaving(false);
    } catch (err: any) {
      setError(err.message || "保存失败");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a14]">
        <div className="flex items-center gap-3 text-zinc-400">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14] text-zinc-200">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-[#0a0a14]/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-white transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            返回
          </button>
          <h2 className="text-sm font-medium truncate max-w-md">
            {slug ? slug : "新建文章"}
          </h2>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white
                       hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {saving ? "保存中..." : "保存并发布"}
          </button>
        </div>
      </header>

      {error && (
        <div className="mx-auto mt-4 max-w-7xl px-6">
          <div className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        </div>
      )}
      {success && (
        <div className="mx-auto mt-4 max-w-7xl px-6">
          <div className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-400">
            {success}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Metadata fields */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">标题</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm
                         text-zinc-200 placeholder-zinc-600 focus:border-blue-600 focus:outline-none"
              placeholder="文章标题"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm
                         text-zinc-200 focus:border-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-500">标签（逗号分隔）</label>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm
                         text-zinc-200 placeholder-zinc-600 focus:border-blue-600 focus:outline-none"
              placeholder="nextjs, react, web"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={draft}
                onChange={(e) => setDraft(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-blue-600"
              />
              <span className="text-sm text-zinc-400">草稿（不对外显示）</span>
            </label>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="mb-1 block text-xs font-medium text-zinc-500">摘要</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm
                       text-zinc-200 placeholder-zinc-600 focus:border-blue-600 focus:outline-none"
            placeholder="文章摘要"
          />
        </div>

        {/* Editor + Preview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">正文（Markdown）</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="h-[60vh] w-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-sm
                         text-zinc-200 placeholder-zinc-600 font-mono leading-relaxed
                         focus:border-blue-600 focus:outline-none resize-none"
              placeholder="在此编写 Markdown 内容..."
              spellCheck={false}
            />
          </div>

          {/* Preview */}
          <div>
            <label className="mb-2 block text-xs font-medium text-zinc-500">预览</label>
            <div
              ref={previewRef}
              className="h-[60vh] w-full overflow-auto rounded-lg border border-zinc-800
                         bg-white p-6 prose prose-sm max-w-none text-zinc-800
                         [&_pre]:bg-zinc-100 [&_pre]:rounded-lg [&_pre]:p-4 [&_code]:text-sm"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page (root)                                                        */
/* ------------------------------------------------------------------ */

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("login");
  const [posts, setPosts] = useState<PostFile[]>([]);
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState("");

  // Restore token from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setPage("list");
    }
  }, []);

  // Load post list
  const loadPosts = useCallback(async (tok: string) => {
    setListLoading(true);
    setListError("");
    try {
      const res = await ghApi(`/repos/${GH_OWNER}/${GH_REPO}/contents/${POSTS_DIR}?ref=${GH_BRANCH}`, tok);
      if (!res.ok) throw new Error("无法获取文章列表");
      const data: PostFile[] = await res.json();
      setPosts(data.filter((f) => f.name.endsWith(".mdx")).sort((a, b) => b.name.localeCompare(a.name)));
    } catch (err: any) {
      setListError(err.message);
    }
    setListLoading(false);
  }, []);

  useEffect(() => {
    if (token && page === "list") loadPosts(token);
  }, [token, page, loadPosts]);

  const handleToken = (t: string) => {
    setToken(t);
    setPage("list");
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setPage("login");
  };

  const openEditor = (slug: string) => {
    setEditSlug(slug);
    setPage("editor");
  };

  const newPost = () => {
    setEditSlug(null);
    setPage("editor");
  };

  if (!token || page === "login") return <LoginPage onToken={handleToken} />;

  if (page === "editor") {
    return <PostEditor slug={editSlug} onBack={() => { setPage("list"); loadPosts(token); }} token={token} />;
  }

  return (
    <PostList
      posts={posts}
      onEdit={openEditor}
      onNew={newPost}
      onLogout={logout}
    />
  );
}
