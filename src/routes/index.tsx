import { createFileRoute } from "@tanstack/react-router";
import { GridBackground } from "../components/GridBackground";
import { AtIcon } from "../components/AtIcon";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <GridBackground />
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 mb-6">
          <AtIcon className="w-8 h-8 text-primary-foreground" />
        </div>

        <h1 className="text-4xl font-semibold text-foreground tracking-tight mb-3">
          Internet Handle
        </h1>

        <p className="text-muted-foreground mb-8">
          authentication manager for AT Protocol applications
        </p>
      </div>
    </>
  );
}
