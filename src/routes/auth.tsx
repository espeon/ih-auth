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
import { parseAuthParams } from "../utils/redirect";
import { getRecentHandles, addHandle, deleteHandle } from "../utils/storage";
import { enrichHandle } from "../utils/api";
import {
  WarningCircleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  QuestionIcon,
} from "@phosphor-icons/react";
import type { StoredHandle } from "../types/auth";
import { AtIcon } from "@/components/AtIcon";
import { PDSSelector } from "@/components/PDSSelector";

type AuthSearch = {
  redirect_uri?: string;
  nonce?: string;
  view?: "main" | "manual" | "signup";
  handle?: string;
  pdsUrl?: string;
};

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (search: Record<string, unknown>): AuthSearch => {
    return {
      redirect_uri: search.redirect_uri as string,
      nonce: search.nonce as string,
      view: (search.view as "main" | "manual" | "signup") || "main",
      handle: search.handle as string,
      pdsUrl: search.pdsUrl as string,
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

    // if we're doing a PDS, skip enrichment
    if (type === "pds") {
      const transitionToRedirecting = () => {
        navigate({
          to: "/redirect",
          search: {
            redirect_uri: authParams.redirect_uri,
            nonce: authParams.nonce,
            pdsUrl: handle,
          },
        });
      };

      if (document.startViewTransition) {
        document.startViewTransition(transitionToRedirecting);
      } else {
        transitionToRedirecting();
      }
      return;
    }

    setIsEnriching(true);

    const enrichedData = await enrichHandle(handle);

    if (type === "handle") addHandle(handle, type, enrichedData);

    const pdsUrl = enrichedData.pdsUrl || handle;

    const transitionToRedirecting = () => {
      console.log("Navigating to redirection");
      navigate({
        to: "/redirect",
        search: {
          redirect_uri: authParams.redirect_uri,
          nonce: authParams.nonce,
          handle: handle,
          pdsUrl: pdsUrl,
        },
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(transitionToRedirecting);
    } else {
      transitionToRedirecting();
    }
  };

  if (!authParams) {
    return (
      <>
        <GridBackground />
        <div className="min-h-screen flex items-center justify-center px-2 py-6">
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
      <div className="min-h-screen flex flex-col items-center justify-center px-2 py-6 gap-6">
        <div className="inline-flex items-center gap-3 view-content-logo">
          <AtIcon className="w-8 h-8 dark:text-indigo-400 text-indigo-600" />
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
                    ? "Choose an account"
                    : "Enter your AT Protocol handle or PDS URL"}{" "}
                  to continue to{" "}
                  <a
                    href={new URL(authParams.redirect_uri).origin}
                    className="dark:text-indigo-300/70 dark:hover:text-indigo-300 text-indigo-600/70 hover:text-indigo-600 font-semibold transition-colors"
                  >
                    {" "}
                    {new URL(authParams.redirect_uri).hostname}
                  </a>
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
                    onAdd={() => transitionToView("manual")}
                  />
                ) : (
                  <HandleInput onSubmit={handleSelection} />
                )}

                <div className="relative flex flex-row justify-end items-center">
                  <button
                    onClick={() => transitionToView("signup")}
                    className="
                    flex flex-row items-center
                      group
                      gap-2
                      text-sm dark:text-indigo-300/70 dark:hover:text-indigo-300 text-indigo-600/70 hover:text-indigo-600 font-semibold
                      transition-colors
                      cursor-pointer
                      py-2
                    "
                  >
                    <span>Or, sign up</span>
                    <CaretRightIcon
                      className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-3 group-hover:ml-1"
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

              <div className="relative flex flex-row justify-end items-center">
                <button
                  onClick={() => transitionToView("signup")}
                  className="
                  flex flex-row items-center
                    group
                    gap-2
                    text-sm dark:text-indigo-300/70 dark:hover:text-indigo-300 text-indigo-600/70 hover:text-indigo-600 font-semibold
                    transition-colors
                    cursor-pointer
                    py-2
                  "
                >
                  <span>Or, sign up</span>
                  <CaretRightIcon
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -ml-3 group-hover:ml-1"
                    weight="bold"
                  />
                </button>
              </div>
            </div>
          )}

          {view === "signup" && (
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
                  Create an account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Choose a hosting provider to get started
                </p>
              </div>
              <PDSSelector
                onSelect={(pdsUrl) => handleSelection(pdsUrl, "pds")}
              />
            </div>
          )}
        </GlassCard>
        <a
          href="https://internethandle.org"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-row items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors hover:bg-accent rounded-lg px-3 py-1 z-10"
        >
          <p>Login managed by the AT Protocol</p>
          <QuestionIcon />
        </a>
      </div>
    </>
  );
}
