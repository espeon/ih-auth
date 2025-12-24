import { useState } from "react";
import { detectInputType } from "../utils/redirect";
import { resolvePDS } from "../utils/api";
import { ArrowRightIcon, WarningCircleIcon } from "@phosphor-icons/react";

interface HandleInputProps {
  onSubmit: (handle: string, type: "handle" | "pds") => void;
}

export function HandleInput({ onSubmit }: HandleInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<{
    handle: string;
    type: "handle" | "pds";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter a handle or PDS URL");
      return;
    }

    const type = detectInputType(trimmed);
    if (!type) {
      setError(
        "Invalid format. Use handle (e.g., user.bsky.social) or PDS URL",
      );
      return;
    }

    setError(null);
    setWarning(null);

    // Only verify handles, not PDS URLs
    if (type === "handle") {
      setIsVerifying(true);
      try {
        const pdsUrl = await resolvePDS(trimmed);
        if (!pdsUrl) {
          // Handle doesn't resolve - show warning with option to continue
          setWarning(
            "Could not verify this handle. It may not exist yet or be temporarily unavailable.",
          );
          setPendingSubmit({ handle: trimmed, type });
          setIsVerifying(false);
          return;
        }
      } catch {
        // Network error or other issue - show warning
        setWarning(
          "Could not verify this handle due to a network issue. You can still continue.",
        );
        setPendingSubmit({ handle: trimmed, type });
        setIsVerifying(false);
        return;
      }
      setIsVerifying(false);
    }

    onSubmit(trimmed, type);
  };

  const handleContinueAnyway = () => {
    if (pendingSubmit) {
      setWarning(null);
      setPendingSubmit(null);
      onSubmit(pendingSubmit.handle, pendingSubmit.type);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    if (error) setError(null);
    if (warning) {
      setWarning(null);
      setPendingSubmit(null);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <div className="relative">
          <input
            id="handle-input"
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="user.bsky.social"
            disabled={isVerifying}
            className="
              w-full
              px-4 py-3
              bg-input
              border border-border
              rounded-xl
              text-foreground placeholder-muted-foreground
              font-mono text-sm
              focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20
              transition-all
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />

          <button
            type="submit"
            disabled={isVerifying}
            className="
              absolute right-2 top-1/2 -translate-y-1/2
              p-2
              bg-primary hover:bg-primary/80
              rounded-lg
              text-primary-foreground
              transition-all
              hover:scale-105
              focus:outline-none focus:ring-2 focus:ring-ring
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
            aria-label="Submit"
          >
            <ArrowRightIcon className="w-4 h-4" weight="bold" />
          </button>
        </div>
      </div>

      {error && (
        <div
          className="
            flex items-start gap-2
            px-3 py-2
            bg-destructive/10
            border border-destructive/20
            rounded-lg
            text-destructive-foreground text-sm
          "
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <WarningCircleIcon
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            weight="bold"
          />
          <span>{error}</span>
        </div>
      )}

      {warning && (
        <div
          className="
            flex flex-col gap-3
            px-3 py-3
            bg-accent
            border border-border
            rounded-lg
            text-accent-foreground text-sm
          "
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="flex items-start gap-2">
            <WarningCircleIcon
              className="w-4 h-4 mt-0.5 flex-shrink-0"
              weight="bold"
            />
            <span>{warning}</span>
          </div>
          <button
            type="button"
            onClick={handleContinueAnyway}
            className="
              self-end
              px-3 py-1.5
              bg-secondary hover:bg-secondary/80
              border border-border
              rounded-lg
              text-secondary-foreground text-xs font-medium
              transition-all
            "
          >
            Continue anyway
          </button>
        </div>
      )}

      {isVerifying && (
        <p className="text-xs text-muted-foreground animate-pulse">
          Verifying handle...
        </p>
      )}

      {!isVerifying && !warning && (
        <p className="text-xs text-muted-foreground">
          Enter your AT Protocol handle or PDS URL to continue
        </p>
      )}
    </form>
  );
}
