"use client";

import { useCallback, useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export default function EditPost() {
  const params = useParams();
  const router = useRouter();
  const slugFromUrl = params?.slug as string;
  const token = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : null;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState(slugFromUrl || "");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [draft, setDraft] = useState(true);
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/admin");
      return;
    }
    if (!slugFromUrl) return;

    (async () => {
      try {
        const res = await fetch(`/api/admin/posts/${slugFromUrl}`, {
          headers: { "x-admin-auth": token! },
        });
        if (res.status === 401) {
          sessionStorage.removeItem("admin_token");
          router.push("/admin");
          return;
        }
        if (!res.ok) {
          setError(res.status === 404 ? "文章不存在" : "加载失败");
          return;
        }
        const data = await res.json();
        setTitle(data.title || "");
        setSlug(data.slug || slugFromUrl);
        setDate(data.date || new Date().toISOString().split("T")[0]);
        setDescription(data.description || "");
        setTagsStr(Array.isArray(data.tags) ? data.tags.join(", ") : "");
        setDraft(data.draft ?? true);
        setBody(data.body || "");
      } catch {
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, slugFromUrl, router]);

  const handleSave = useCallback(
    async (publish: boolean) => {
      if (!token) return;
      if (!title.trim()) { setError("请输入标题"); return; }
      if (!slug.trim()) { setError("请输入 slug"); return; }

      setSaving(true);
      setError("");

      const tags = tagsStr
        .split(/[,，、\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);

      try {
        const res = await fetch("/api/admin/posts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-auth": token,
          },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim(),
            date,
            description: description.trim(),
            tags,
            draft: publish ? false : true,
            content: body,
            message: publish
              ? `Publish: ${title.trim()}`
              : `Update: ${title.trim()}`,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Save failed");
        }

        router.push("/admin/dashboard");
      } catch (err: any) {
        setError(err.message || "保存失败");
      } finally {
        setSaving(false);
      }
    },
    [token, title, slug, date, description, tagsStr, body, router]
  );

  const handleDelete = async () => {
    if (!confirm(`确定删除「${title}」？`)) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${slug}`, {
        method: "DELETE",
        headers: { "x-admin-auth": token! },
      });
      if (!res.ok) throw new Error("Delete failed");
      router.push("/admin/dashboard");
    } catch {
      setError("删除失败");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="editor-page">
        <div className="loading-state">
          <span className="spinner-lg" />
          <p>加载文章中...</p>
        </div>
        <style jsx>{`
          .editor-page {
            min-height: 100vh; background: #0a0a0f;
            display: flex; align-items: center; justify-content: center;
            font-family: var(--font-geist-mono), monospace;
          }
          .loading-state { text-align: center; color: rgba(255,255,255,0.4); }
          .loading-state p { margin-top: 1rem; }
          .spinner-lg {
            display: inline-block; width: 24px; height: 24px;
            border: 2px solid rgba(255,255,255,0.1);
            border-top-color: rgba(120,80,255,0.8);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="eh-left">
          <Link href="/admin/dashboard" className="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            返回
          </Link>
          <div className="title-section">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              className="title-input"
            />
            {slug && (
              <span className="slug-hint">
                tvegis-blog.vercel.app/posts/{slug}
              </span>
            )}
          </div>
        </div>
        <div className="eh-right">
          <button onClick={handleDelete} disabled={saving} className="btn-delete">
            删除
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="btn-save"
          >
            {saving ? "保存中..." : "保存草稿"}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="btn-publish"
          >
            {saving ? "发布中..." : "发布"}
          </button>
        </div>
      </header>

      <div className="editor-body">
        {error && <div className="editor-error">{error}</div>}

        <div className="meta-panel">
          <div className="meta-row">
            <div className="meta-field">
              <label>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="article-slug"
                className="meta-input mono"
              />
            </div>
            <div className="meta-field">
              <label>日期</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="meta-input"
              />
            </div>
            <div className="meta-field">
              <label>状态</label>
              <div className="draft-toggle">
                <button
                  onClick={() => setDraft(true)}
                  className={`toggle-btn ${draft ? "active-draft" : ""}`}
                >
                  草稿
                </button>
                <button
                  onClick={() => setDraft(false)}
                  className={`toggle-btn ${!draft ? "active-pub" : ""}`}
                >
                  已发布
                </button>
              </div>
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-field wide">
              <label>描述</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="文章摘要..."
                className="meta-input"
              />
            </div>
          </div>
          <div className="meta-row">
            <div className="meta-field wide">
              <label>标签（用逗号分隔）</label>
              <input
                type="text"
                value={tagsStr}
                onChange={(e) => setTagsStr(e.target.value)}
                placeholder="nextjs, react, web"
                className="meta-input mono"
              />
            </div>
          </div>
        </div>

        <div className="editor-main" data-color-mode="dark">
          <MDEditor
            value={body}
            onChange={(val) => setBody(val || "")}
            height={600}
            visibleDragbar={false}
            preview="live"
          />
        </div>
      </div>

      <style jsx>{`
        .editor-page {
          min-height: 100vh;
          background: #0a0a0f;
          font-family: var(--font-geist-sans), -apple-system, sans-serif;
        }
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: rgba(10,10,15,0.85);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 20;
          gap: 1rem;
        }
        .eh-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
          min-width: 0;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 0.6rem;
          border-radius: 8px;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          font-size: 0.85rem;
          transition: all 0.15s;
          flex-shrink: 0;
        }
        .back-btn:hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.05); }
        .title-section { flex: 1; min-width: 0; }
        .title-input {
          width: 100%;
          background: transparent;
          border: none;
          color: #f0f0f0;
          font-size: 1.15rem;
          font-weight: 600;
          outline: none;
          font-family: inherit;
          letter-spacing: -0.01em;
        }
        .title-input::placeholder { color: rgba(255,255,255,0.2); }
        .slug-hint {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.25);
          font-family: var(--font-geist-mono), monospace;
          margin-top: 0.15rem;
        }
        .eh-right {
          display: flex;
          gap: 0.6rem;
          flex-shrink: 0;
        }
        .btn-save, .btn-publish, .btn-delete {
          padding: 0.55rem 1.1rem;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .btn-save {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
        }
        .btn-save:hover:not(:disabled) { background: rgba(255,255,255,0.1); color: #fff; }
        .btn-publish {
          background: linear-gradient(135deg, #7850ff, #5050ff);
          border: none;
          color: #fff;
        }
        .btn-publish:hover:not(:disabled) { opacity: 0.9; }
        .btn-delete {
          background: transparent;
          border: 1px solid rgba(255,50,50,0.2);
          color: rgba(255,100,100,0.6);
        }
        .btn-delete:hover:not(:disabled) {
          background: rgba(255,50,50,0.1);
          color: #ff6b6b;
          border-color: rgba(255,50,50,0.3);
        }
        .btn-save:disabled, .btn-publish:disabled, .btn-delete:disabled { opacity: 0.4; cursor: not-allowed; }
        .editor-body {
          max-width: 1000px;
          margin: 0 auto;
          padding: 1.5rem;
        }
        .editor-error {
          padding: 0.7rem 1rem;
          background: rgba(255,50,50,0.08);
          border: 1px solid rgba(255,50,50,0.15);
          border-radius: 10px;
          color: #ff6b6b;
          margin-bottom: 1rem;
          font-size: 0.85rem;
        }
        .meta-panel {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1.2rem;
          margin-bottom: 1.5rem;
        }
        .meta-row { display: flex; gap: 1rem; margin-bottom: 0.8rem; }
        .meta-row:last-child { margin-bottom: 0; }
        .meta-field { flex: 1; min-width: 0; }
        .meta-field.wide { flex: 2; }
        .meta-field label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.35);
          margin-bottom: 0.3rem;
          font-family: var(--font-geist-mono), monospace;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .meta-input {
          width: 100%;
          padding: 0.5rem 0.7rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
          box-sizing: border-box;
        }
        .meta-input:focus { border-color: rgba(120,80,255,0.3); }
        .meta-input.mono { font-family: var(--font-geist-mono), monospace; }
        .meta-input::placeholder { color: rgba(255,255,255,0.2); }
        .draft-toggle { display: flex; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
        .toggle-btn {
          flex: 1; padding: 0.5rem 0.8rem; background: transparent; border: none;
          color: rgba(255,255,255,0.4); font-size: 0.8rem; cursor: pointer;
          transition: all 0.15s; font-family: inherit;
        }
        .toggle-btn.active-draft { background: rgba(255,180,50,0.15); color: #e8b840; }
        .toggle-btn.active-pub { background: rgba(50,200,100,0.15); color: #50d080; }
        .editor-main {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
      `}</style>
    </div>
  );
}
