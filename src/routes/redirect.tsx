import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { GridBackground } from "../components/GridBackground";
import { GlassCard } from "../components/GlassCard";
import Throbber from "@/components/Throbber";

type RedirectingSearch = {
  redirect_uri: string;
  nonce: string;
  handle?: string;
  pdsUrl: string;
  no_redirect?: boolean;
};

export const Route = createFileRoute("/redirect")({
  component: RedirectingPage,
  validateSearch: (search: Record<string, unknown>): RedirectingSearch => {
    return {
      redirect_uri: search.redirect_uri as string,
      nonce: search.nonce as string,
      handle: search.handle as string | undefined,
      pdsUrl: search.pdsUrl as string,
      no_redirect: search.no_redirect as boolean,
    };
  },
});

function RedirectingPage() {
  const searchParams = useSearch({ from: "/redirect" });

  useEffect(() => {
    if (searchParams.no_redirect) return;

    const timer = setTimeout(() => {
      const redirectUrl = new URL(searchParams.redirect_uri);
      redirectUrl.searchParams.set("nonce", searchParams.nonce);
      redirectUrl.searchParams.set(
        "hint",
        searchParams.handle || searchParams.pdsUrl,
      );
      //window.location.href = redirectUrl.toString();
    }, 1200);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <>
      <GridBackground />
      <div className="min-h-screen flex items-center justify-center p-6">
        <GlassCard className="max-w-lg w-full px-0.5">
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-6 view-content">
              <Throbber />
              <p className="text-base text-muted-foreground">
                Redirecting to {new URL(searchParams.pdsUrl).hostname} to
                complete sign in...
              </p>
            </div>
          </div>
          <div className="w-full bg-background rounded-b-full h-3 overflow-hidden border-background">
            <div className="h-full bg-primary/25 animate-[progress_1200ms_ease-out_forwards]  border-t-8 border-background" />
          </div>
        </GlassCard>
      </div>
    </>
  );
}
