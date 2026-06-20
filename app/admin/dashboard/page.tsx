"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  draft: boolean;
}

export default function AdminDashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const router = useRouter();

  const token = typeof window !== "undefined" ? sessionStorage.getItem("admin_token") : null;

  const fetchPosts = useCallback(async () => {
    if (!token) {
      router.push("/admin");
      return;
    }

    try {
      const res = await fetch("/api/admin/posts", {
        headers: { "x-admin-auth": token },
      });
      if (res.status === 401) {
        sessionStorage.removeItem("admin_token");
        router.push("/admin");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to load posts");
        return;
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token, router]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`确定删除「${title}」？此操作不可撤销。`)) return;
    setDeleting(slug);

    try {
      const res = await fetch(`/api/admin/posts/${slug}`, {
        method: "DELETE",
        headers: { "x-admin-auth": token! },
      });
      if (!res.ok) throw new Error("Delete failed");
      setPosts((prev) => prev.filter((p) => p.slug !== slug));
    } catch {
      alert("删除失败，请重试");
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (d: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <span className="spinner-lg" />
          <p>加载中...</p>
        </div>
        <style jsx>{`
          .dashboard {
            min-height: 100vh;
            background: var(--admin-bg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-geist-mono), monospace;
          }
          .loading-state {
            text-align: center;
            color: rgba(255,255,255,0.4);
          }
          .loading-state p { margin-top: 1rem; }
          .spinner-lg {
            display: inline-block;
            width: 24px; height: 24px;
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
    <div className="dashboard">
      <header className="dash-header">
        <div className="header-left">
          <h1 className="dash-title">文章管理</h1>
          <span className="post-count">{posts.length} 篇文章</span>
        </div>
        <div className="header-right">
          <Link href="/admin/editor" className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新建文章
          </Link>
          <Link href="/" className="btn-ghost" title="返回博客">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </Link>
        </div>
      </header>

      <main className="dash-main">
        {error && <div className="dash-error">{error}</div>}

        {posts.length === 0 ? (
          <div className="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" style={{color:'rgba(255,255,255,0.15)'}}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
            <p>还没有文章</p>
            <Link href="/admin/editor" className="btn-primary">写第一篇文章</Link>
          </div>
        ) : (
          <div className="post-grid">
            {posts.map((post) => (
              <div key={post.slug} className="post-card">
                <div className="card-header">
                  <span className={`status-badge ${post.draft ? "draft" : "published"}`}>
                    {post.draft ? "草稿" : "已发布"}
                  </span>
                  <span className="post-date">{formatDate(post.date)}</span>
                </div>
                <Link href={`/admin/editor/${post.slug}`} className="card-body">
                  <h2 className="card-title">{post.title}</h2>
                  {post.description && (
                    <p className="card-desc">{post.description}</p>
                  )}
                </Link>
                {post.tags && post.tags.length > 0 && (
                  <div className="card-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="card-actions">
                  <Link
                    href={`/admin/editor/${post.slug}`}
                    className="action-btn"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    编辑
                  </Link>
                  <button
                    onClick={() => handleDelete(post.slug, post.title)}
                    disabled={deleting === post.slug}
                    className="action-btn"
                  >
                    {deleting === post.slug ? "删除中..." : "删除"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background: var(--admin-bg);
          font-family: var(--font-geist-sans), -apple-system, sans-serif;
          transition: background 0.2s ease;
        }
        .dash-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--admin-border);
          background: var(--admin-header-bg);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 10;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .header-left {
          display: flex;
          align-items: baseline;
          gap: 1rem;
        }
        .dash-title {
          color: var(--admin-primary);
          font-size: 1.3rem;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .post-count {
          color: var(--admin-muted);
          font-size: 0.85rem;
          font-family: var(--font-geist-mono), monospace;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          background: linear-gradient(135deg, #7850ff, #5050ff);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .btn-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: 1px solid var(--admin-border);
          background: transparent;
          color: var(--admin-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover {
          background: var(--admin-card-hover-bg);
          color: var(--admin-primary);
        }
        .dash-main {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        .dash-error {
          padding: 0.8rem 1rem;
          background: rgba(255,50,50,0.08);
          border: 1px solid rgba(255,50,50,0.15);
          border-radius: 10px;
          color: #ff6b6b;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--admin-muted);
        }
        .empty-state p {
          margin: 1.5rem 0;
          font-size: 1rem;
        }
        .post-grid {
          display: grid;
          gap: 1rem;
        }
        .post-card {
          background: var(--admin-card-bg);
          border: 1px solid var(--admin-border);
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .post-card:hover {
          border-color: var(--admin-border-hover);
          background: var(--admin-card-hover-bg);
        }
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.8rem 1.2rem 0;
        }
        .status-badge {
          font-size: 0.75rem;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-family: var(--font-geist-mono), monospace;
          letter-spacing: 0.02em;
        }
        .status-badge.published {
          background: rgba(50, 200, 100, 0.1);
          color: #50d080;
          border: 1px solid rgba(50, 200, 100, 0.2);
        }
        .status-badge.draft {
          background: rgba(255, 180, 50, 0.1);
          color: #e8b840;
          border: 1px solid rgba(255, 180, 50, 0.2);
        }
        .post-date {
          color: var(--admin-muted);
          font-size: 0.8rem;
          font-family: var(--font-geist-mono), monospace;
        }
        .card-body {
          display: block;
          padding: 0.8rem 1.2rem 1rem;
          text-decoration: none;
          cursor: pointer;
        }
        .card-title {
          color: var(--admin-primary);
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 0.3rem;
          letter-spacing: -0.01em;
        }
        .card-desc {
          color: var(--admin-secondary);
          font-size: 0.85rem;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.6rem;
        }
        .tag {
          font-size: 0.75rem;
          padding: 0.15rem 0.5rem;
          border-radius: 5px;
          background: rgba(120, 80, 255, 0.1);
          color: rgba(180, 150, 255, 0.8);
          border: 1px solid rgba(120, 80, 255, 0.15);
          font-family: var(--font-geist-mono), monospace;
        }
        .card-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0 1.2rem 0.8rem;
        }
        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.8rem;
          border-radius: 7px;
          font-size: 0.8rem;
          color: var(--admin-text);
          text-decoration: none;
          border: 1px solid transparent;
          background: transparent;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .action-btn:hover {
          background: var(--admin-card-hover-bg);
          color: var(--admin-primary);
          border-color: var(--admin-border);
        }
        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
