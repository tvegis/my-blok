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
      `}</style>
      {children}
    </>
  );
}
