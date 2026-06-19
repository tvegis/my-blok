"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);

      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Login failed");
          return;
        }

        // Store password in session storage (cleared on tab close)
        sessionStorage.setItem("admin_token", password);
        router.push("/admin/dashboard");
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [password, router]
  );

  return (
    <div className="admin-login">
      <div className="login-bg" />
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L3 7.5v9L12 21l9-4.5v-9L12 3z"/>
              <path d="M12 12l9-4.5"/>
              <path d="M12 12v9"/>
              <path d="M12 12L3 7.5"/>
              <path d="M6 9.75v4.5l6 3"/>
            </svg>
          </div>
          <h1 className="login-title">内容管理</h1>
          <p className="login-subtitle">输入管理密码以继续</p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-wrapper">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="管理密码"
                autoFocus
                className="login-input"
                disabled={loading}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button
              type="submit"
              disabled={loading || !password}
              className="login-button"
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner" />
                  验证中...
                </span>
              ) : (
                "进入后台"
              )}
            </button>
          </form>
        </div>
        <p className="login-footer">博客后台管理系统</p>
      </div>

      <style jsx>{`
        .admin-login {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          font-family: var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .login-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(120, 80, 255, 0.15), transparent),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0, 200, 255, 0.08), transparent),
            radial-gradient(ellipse 50% 40% at 20% 60%, rgba(180, 100, 255, 0.06), transparent);
        }
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          padding: 2rem;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          padding: 2.5rem 2rem;
          text-align: center;
        }
        .login-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto 1.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
          background: linear-gradient(135deg, rgba(120, 80, 255, 0.2), rgba(0, 200, 255, 0.1));
          border: 1px solid rgba(120, 80, 255, 0.2);
          color: rgba(180, 150, 255, 0.9);
        }
        .login-title {
          color: #f0f0f0;
          font-size: 1.4rem;
          font-weight: 600;
          margin-bottom: 0.4rem;
          letter-spacing: -0.02em;
        }
        .login-subtitle {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .input-wrapper {
          position: relative;
        }
        .login-input {
          width: 100%;
          padding: 0.85rem 1rem;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          color: #f0f0f0;
          font-size: 0.95rem;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }
        .login-input:focus {
          border-color: rgba(120, 80, 255, 0.4);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 3px rgba(120, 80, 255, 0.1);
        }
        .login-input:disabled {
          opacity: 0.5;
        }
        .login-error {
          color: #ff6b6b;
          font-size: 0.85rem;
          padding: 0.6rem 0.8rem;
          background: rgba(255, 50, 50, 0.08);
          border: 1px solid rgba(255, 50, 50, 0.15);
          border-radius: 8px;
        }
        .login-button {
          padding: 0.85rem;
          background: linear-gradient(135deg, #7850ff, #5050ff);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .login-button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .login-button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-footer {
          text-align: center;
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.8rem;
          margin-top: 1.5rem;
        }
      `}</style>
    </div>
  );
}
