import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = "" }: GlassCardProps) {
  return (
    <div
      className={`
        relative
        border border-border
        rounded-2xl
        shadow-2xl shadow-black/20
        view-content-card
        ${className}
      `}
    >
      <div className="absolute inset-0 rounded-2xl bg-card/75 blur-3xl pointer-events-none -z-3">
        <div
          className="absolute inset-0 blur-sm"
          style={{
            backgroundImage: `
            linear-gradient(oklch(0.439 0 0 / 0.2) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.439 0 0 / 0.2) 1px, transparent 1px)
          `,
            backgroundSize: "32px 32px",
            backgroundPosition: "center center",
            maskImage:
              "radial-gradient(circle at 50% 0%, black 0%, black 20%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 0%, black 0%, black 20%, transparent 100%)",
          }}
        />
      </div>
      <div className="absolute inset-0 rounded-2xl bg-card/50 pointer-events-none -z-2" />
      {children}
    </div>
  );
}
