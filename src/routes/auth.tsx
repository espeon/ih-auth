import {
  createFileRoute,
  useNavigate,
  useSearch,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { GridBackground } from "../components/GridBackground";
import { GlassCard } from "../components/GlassCard";
import { HandleSelector } from "../components/HandleSelector";
import { HandleInput } from "../components/HandleInput";
import { parseAuthParams, buildRedirectUrl } from "../utils/redirect";
import { getRecentHandles, addHandle, deleteHandle } from "../utils/storage";
import { enrichHandle } from "../utils/api";
import {
  WarningCircleIcon,
  CaretLeftIcon,
  ArrowSquareOutIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";
import type { StoredHandle } from "../types/auth";
import { AtIcon } from "@/components/AtIcon";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

type AuthSearch = {
  redirect_uri?: string;
  nonce?: string;
  view?: "main" | "manual" | "signup";
};

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    return {
      redirect_uri: search.redirect_uri as string,
      nonce: search.nonce as string,
      view: (search.view as "main" | "manual" | "signup") || "main",
    };
  },
});

function AuthPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/auth" });
  const [authParams] = useState(() => parseAuthParams(window.location.search));
  const [recentHandles, setRecentHandles] = useState<StoredHandle[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);

  const hasRecentHandles = recentHandles.length > 0;
  const view = searchParams.view || (hasRecentHandles ? "main" : "manual");

  const transitionToView = (newView: "main" | "manual" | "signup") => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate({
          to: "/auth",
          search: {
            redirect_uri: searchParams.redirect_uri,
            nonce: searchParams.nonce,
            view: newView,
          },
        });
      });
    } else {
      navigate({
        to: "/auth",
        search: {
          redirect_uri: searchParams.redirect_uri,
          nonce: searchParams.nonce,
          view: newView,
        },
      });
    }
  };

  useEffect(() => {
    const handles = getRecentHandles();
    setRecentHandles(handles);

    const enrichExistingHandles = async () => {
      const handlesToEnrich = handles.filter((h) => !h.profile || !h.pdsUrl);
      if (handlesToEnrich.length === 0) return;

      const enrichedData = await Promise.all(
        handlesToEnrich.map((h) => enrichHandle(h.handle)),
      );

      const updated = handles.map((h) => {
        const enrichmentIndex = handlesToEnrich.findIndex(
          (eh) => eh.handle === h.handle,
        );
        if (enrichmentIndex !== -1) {
          const enriched = enrichedData[enrichmentIndex];
          return {
            ...h,
            profile: enriched.profile || h.profile,
            pdsUrl: enriched.pdsUrl || h.pdsUrl,
          };
        }
        return h;
      });

      setRecentHandles(updated);

      updated.forEach((h) => {
        const oldHandle = handles.find((old) => old.handle === h.handle);
        if (
          h.profile !== oldHandle?.profile ||
          h.pdsUrl !== oldHandle?.pdsUrl
        ) {
          addHandle(h.handle, h.type, { profile: h.profile, pdsUrl: h.pdsUrl });
        }
      });
    };

    enrichExistingHandles();
  }, []);

  const handleSelection = async (handle: string, type: "handle" | "pds") => {
    if (!authParams || isEnriching) return;

    setIsEnriching(true);

    const enrichedData = await enrichHandle(handle);

    addHandle(handle, type, enrichedData);

    const redirectUrl = buildRedirectUrl(
      authParams.redirect_uri,
      authParams.nonce,
      enrichedData.pdsUrl || handle,
    );

    window.location.href = redirectUrl;
  };

  if (!authParams) {
    return (
      <>
        <GridBackground />
        <div className="min-h-screen flex items-center justify-center p-6">
          <GlassCard className="max-w-lg w-full p-8 animate-scaleIn">
            <div className="flex items-start gap-3 text-destructive-foreground">
              <WarningCircleIcon
                className="w-6 h-6 flex-shrink-0 mt-0.5"
                weight="bold"
              />
              <div>
                <h1 className="text-xl font-semibold mb-2">
                  Missing Parameters
                </h1>
                <p className="text-sm text-foreground leading-relaxed">
                  This page requires{" "}
                  <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    redirect_uri
                  </code>{" "}
                  and{" "}
                  <code className="px-1.5 py-0.5 bg-muted rounded text-xs">
                    nonce
                  </code>{" "}
                  query parameters.
                </p>
                <button
                  onClick={() => navigate({ to: "/" })}
                  className="
                    mt-4 px-4 py-2
                    bg-primary hover:bg-primary/80
                    rounded-lg
                    text-sm font-medium
                    transition-colors
                  "
                >
                  Go to Home
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

  return (
    <>
      <GridBackground />
      <div className="absolute right-2 top-2 inset-0">
        <ThemeSwitcher />
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-6">
        <div className="inline-flex items-center gap-3 view-content-logo">
          <AtIcon className="w-8 h-8 text-primary" />
          <h2 className="text-3xl text-foreground">Internet Handle</h2>
        </div>
        <GlassCard className="max-w-lg w-full px-8 py-6 animate-scaleIn">
          {view === "main" && (
            <div className="view-content">
              <div className="mb-4">
                <h1 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
                  {hasRecentHandles
                    ? "Sign in to continue"
                    : "Enter your handle"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {hasRecentHandles
                    ? "Choose a recent account"
                    : "Enter your AT Protocol handle or PDS URL"}
                  {". "}
                  <br />
                  You'll be redirected to your personal data service to complete
                  sign in.
                </p>
              </div>

              <div className="space-y-4">
                {hasRecentHandles ? (
                  <HandleSelector
                    handles={recentHandles}
                    onSelect={(handle) => {
                      const stored = recentHandles.find(
                        (h) => h.handle === handle,
                      );
                      handleSelection(handle, stored?.type || "handle");
                    }}
                    onDelete={(handle) => {
                      deleteHandle(handle);
                      setRecentHandles(getRecentHandles());
                    }}
                  />
                ) : (
                  <HandleInput onSubmit={handleSelection} />
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <div
                  className={`grid ${hasRecentHandles ? "grid-cols-2" : null} gap-3`}
                >
                  {hasRecentHandles && (
                    <button
                      onClick={() => transitionToView("manual")}
                      className="
                      group
                      relative
                      flex items-center justify-center
                      px-4 py-3
                      bg-secondary hover:bg-secondary/80
                      border border-border
                      rounded-xl
                      text-sm text-secondary-foreground
                      transition-all
                      hover:translate-x-0.5
                    "
                    >
                      <span>Enter your handle</span>
                      <CaretRightIcon
                        className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-2"
                        weight="bold"
                      />
                    </button>
                  )}

                  <button
                    onClick={() => transitionToView("signup")}
                    className="
                      group
                      relative
                      flex items-center justify-center
                      px-4 py-2
                      bg-primary/10 hover:bg-primary/20
                      border border-primary/20 hover:border-primary/40
                      rounded-xl
                      text-sm text-primary
                      transition-all
                      hover:translate-x-0.5
                    "
                  >
                    <span>Sign up</span>
                    <CaretRightIcon
                      className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-2"
                      weight="bold"
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === "manual" && (
            <div className="view-content">
              <div className="mb-4">
                <button
                  onClick={() => transitionToView("main")}
                  className="
                    inline-flex items-center gap-2
                    text-sm text-muted-foreground hover:text-foreground
                    transition-colors
                    mb-4
                  "
                >
                  <CaretLeftIcon className="w-4 h-4" weight="bold" />
                  Back
                </button>

                <h1 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
                  Enter your handle
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your AT Protocol handle or PDS URL
                </p>
              </div>

              <HandleInput onSubmit={handleSelection} />
            </div>
          )}

          {view === "signup" && (
            <div className="view-content">
              <div className="mb-8">
                <button
                  onClick={() => transitionToView("main")}
                  className="
                    inline-flex items-center gap-2
                    text-sm text-muted-foreground hover:text-foreground
                    transition-colors
                    mb-4
                  "
                >
                  <CaretLeftIcon className="w-4 h-4" weight="bold" />
                  Back
                </button>

                <h1 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a hosting provider to get started
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://bsky.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-between
                    px-4 py-4
                    bg-card hover:bg-accent
                    border border-border hover:border-primary/50
                    rounded-xl
                    transition-all
                    group
                  "
                >
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      Bluesky
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Official Bluesky hosting
                    </div>
                  </div>
                  <ArrowSquareOutIcon
                    className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                    weight="bold"
                  />
                </a>

                <a
                  href="https://pdslist.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    flex items-center justify-between
                    px-4 py-4
                    bg-card hover:bg-accent
                    border border-border hover:border-primary/50
                    rounded-xl
                    transition-all
                    group
                  "
                >
                  <div>
                    <div className="text-sm font-medium text-foreground mb-1">
                      Browse PDS Providers
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Find alternative hosting providers
                    </div>
                  </div>
                  <ArrowSquareOutIcon
                    className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors"
                    weight="bold"
                  />
                </a>
              </div>
            </div>
          )}

          <div className="mt-8 border-border">
            <p className="text-xs text-muted-foreground text-center">
              Redirecting to{" "}
              <span className="text-foreground font-mono ml-0.5">
                {new URL(authParams.redirect_uri).hostname}
              </span>
            </p>
          </div>
        </GlassCard>
        <a
          href="https://internethandle.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-accent rounded-lg px-3 py-1"
        >
          <p>What's an internet handle? </p>
          <ArrowSquareOutIcon />
        </a>
      </div>
    </>
  );
}
