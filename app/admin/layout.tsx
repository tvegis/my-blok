"use client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Hide particle/cursor effects on admin pages */}
      <style jsx global>{`
        body > canvas {
          display: none !important;
        }
        [class*="mix-blend-difference"] {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
