export function GridBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.439 0 0 / 0.2) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.439 0 0 / 0.2) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px",
          backgroundPosition: "center center",
          maskImage:
            "radial-gradient(circle at 50% 0%, black 0%, black 20%, transparent 60%)",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 0%, black 0%, black 20%, transparent 60%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, var(--primary) / 0.05 0%, transparent 50%)",
        }}
      />
    </div>
  );
}
