import { createFileRoute } from "@tanstack/react-router";
import { GridBackground } from "../components/GridBackground";
import { GlassCard } from "../components/GlassCard";
import { AtIcon } from "../components/AtIcon";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <GridBackground />
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="max-w-xl w-full p-12 animate-scaleIn text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6">
            <AtIcon className="w-8 h-8 text-primary-foreground" />
          </div>

          <h1 className="text-4xl font-semibold text-foreground tracking-tight mb-3">
            AT Auth
          </h1>

          <p className="text-muted-foreground mb-8">
            authentication redirector for AT Protocol applications
          </p>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>client-side only</p>
            <p>no data stored server-side</p>
          </div>
        </GlassCard>
      </div>
    </>
  );
}
