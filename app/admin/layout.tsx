"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style jsx global>{`
        /* ========================
           Admin global overrides
           ======================== */

        /* 1. Restore system cursor on admin pages */
        html[data-route="admin"] * {
          cursor: auto !important;
        }

        /* 2. Hide site navigation header & footer on admin pages */
        html[data-route="admin"] body > div > header,
        html[data-route="admin"] body > div > footer {
          display: none !important;
        }

        /* 3. Remove top padding from main (normally pt-16 for the header) */
        html[data-route="admin"] main {
          padding-top: 0 !important;
        }

        /* ==================================
           Editor theme CSS variables
           ================================== */

        /* Dark theme (default) */
        html[data-editor-theme="dark"] {
          --ed-bg: #0a0a0f;
          --ed-header-bg: rgba(10,10,15,0.85);
          --ed-border: rgba(255,255,255,0.06);
          --ed-border-mid: rgba(255,255,255,0.1);
          --ed-border-input: rgba(255,255,255,0.08);
          --ed-meta-bg: rgba(255,255,255,0.03);
          --ed-input-bg: rgba(255,255,255,0.05);
          --ed-hover-bg: rgba(255,255,255,0.05);
          --ed-btn-save-bg: rgba(255,255,255,0.06);
          --ed-text: #f0f0f0;
          --ed-text-secondary: #e0e0e0;
          --ed-text-muted: rgba(255,255,255,0.4);
          --ed-text-label: rgba(255,255,255,0.35);
          --ed-text-placeholder: rgba(255,255,255,0.2);
          --ed-text-slug: rgba(255,255,255,0.25);
          --ed-btn-save-text: rgba(255,255,255,0.7);
        }

        /* Light theme */
        html[data-editor-theme="light"] {
          --ed-bg: #f8f7f4;
          --ed-header-bg: rgba(248,247,244,0.9);
          --ed-border: rgba(0,0,0,0.06);
          --ed-border-mid: rgba(0,0,0,0.1);
          --ed-border-input: rgba(0,0,0,0.08);
          --ed-meta-bg: rgba(0,0,0,0.02);
          --ed-input-bg: rgba(0,0,0,0.03);
          --ed-hover-bg: rgba(0,0,0,0.04);
          --ed-btn-save-bg: rgba(0,0,0,0.04);
          --ed-text: #1a1a1a;
          --ed-text-secondary: #2a2a2a;
          --ed-text-muted: rgba(0,0,0,0.45);
          --ed-text-label: rgba(0,0,0,0.4);
          --ed-text-placeholder: rgba(0,0,0,0.25);
          --ed-text-slug: rgba(0,0,0,0.3);
          --ed-btn-save-text: rgba(0,0,0,0.6);
        }
      `}</style>
      {children}
    </>
  );
}
