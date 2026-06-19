"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s一-鿿-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "untitled";
}

export default function NewPost() {
  const router = useRouter();
  const token = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : null;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [tagsStr, setTagsStr] = useState("");
  const [draft, setDraft] = useState(true);
  const [body, setBody] = useState("# 新文章\n\n在这里开始写作...");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const slugTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) router.push("/admin");
  }, [token, router]);

  const handleTitleChange = useCallback(
    (val: string) => {
      setTitle(val);
      if (!slugEdited) {
        clearTimeout(slugTimeout.current);
        slugTimeout.current = setTimeout(() => {
          setSlug(generateSlug(val));
        }, 300);
      }
    },
    [slugEdited]
  );

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
              : `Draft: ${title.trim()}`,
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
              onChange={(e) => handleTitleChange(e.target.value)}
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
                onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
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
        .back-btn:hover {
          color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.05);
        }
        .title-section {
          flex: 1;
          min-width: 0;
        }
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
        .title-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
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
        .btn-save, .btn-publish {
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
        .btn-save:hover:not(:disabled) {
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .btn-publish {
          background: linear-gradient(135deg, #7850ff, #5050ff);
          border: none;
          color: #fff;
        }
        .btn-publish:hover:not(:disabled) { opacity: 0.9; }
        .btn-save:disabled, .btn-publish:disabled { opacity: 0.4; cursor: not-allowed; }
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
        .meta-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.8rem;
        }
        .meta-row:last-child { margin-bottom: 0; }
        .meta-field {
          flex: 1;
          min-width: 0;
        }
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
        .meta-input:focus {
          border-color: rgba(120,80,255,0.3);
        }
        .meta-input.mono {
          font-family: var(--font-geist-mono), monospace;
        }
        .meta-input::placeholder {
          color: rgba(255,255,255,0.2);
        }
        .draft-toggle {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .toggle-btn {
          flex: 1;
          padding: 0.5rem 0.8rem;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.4);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .toggle-btn.active-draft {
          background: rgba(255,180,50,0.15);
          color: #e8b840;
        }
        .toggle-btn.active-pub {
          background: rgba(50,200,100,0.15);
          color: #50d080;
        }
        .editor-main {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .editor-main :global(.w-md-editor) {
          background: rgba(255,255,255,0.02) !important;
        }
        .editor-main :global(.w-md-editor-toolbar) {
          background: rgba(255,255,255,0.03) !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
        }
      `}</style>
    </div>
  );
}
