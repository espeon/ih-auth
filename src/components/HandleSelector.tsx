import type { StoredHandle } from "../types/auth";
import {
  GlobeIcon,
  TrashIcon,
  UserIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

interface HandleSelectorProps {
  handles: StoredHandle[];
  onSelect: (handle: string) => void;
  onDelete: (handle: string) => void;
}

export function HandleSelector({
  handles,
  onSelect,
  onDelete,
}: HandleSelectorProps) {
  if (handles.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {handles.map((stored, index) => (
          <div
            key={stored.handle}
            className="group relative"
            style={{
              animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
            }}
          >
            <button
              onClick={() => onSelect(stored.handle)}
              className="
                w-full
                flex items-center gap-3
                px-2 py-2
                bg-card hover:bg-accent
                border border-border hover:border-primary/50
                rounded-xl
                transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10
                text-left
              "
            >
              {stored.profile?.avatar ? (
                <img
                  src={stored.profile.avatar}
                  alt={stored.profile.displayName || stored.handle}
                  className="
                  w-10 h-10
                  rounded-lg
                  object-cover
                  border border-primary/20
                  group-hover:border-primary/40
                  transition-colors
                "
                />
              ) : (
                <div
                  className="
                flex items-center justify-center
                w-10 h-10
                rounded-lg
                bg-gradient-to-br from-primary/20 to-primary/30
                border border-primary/20
                group-hover:border-primary/40
                transition-colors
              "
                >
                  {stored.type === "handle" ? (
                    <UserIcon className="w-5 h-5 text-primary" weight="bold" />
                  ) : (
                    <GlobeIcon className="w-5 h-5 text-primary" weight="bold" />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                {stored.profile?.displayName && (
                  <div className="text-sm text-foreground font-medium truncate">
                    @{stored.handle}
                  </div>
                )}
                <div className="font-mono text-xs text-muted-foreground truncate">
                  via {stored.pdsUrl}
                </div>
              </div>
              <div className="flex flex-row items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(stored.handle);
                  }}
                  className="
                  group
                 hover:bg-destructive/20
                 hover:border-destructive/40
                 p-1.5
                rounded-lg
                opacity-0 group-hover:opacity-100
                transition-all
                hover:scale-105
                text-destructive/30
                 hover:text-destructive/80
              "
                  aria-label="Delete account"
                >
                  <TrashIcon
                    className="w-4 h-4 transition-colors"
                    weight="bold"
                  />
                </button>

                <div
                  className="
              opacity-0 group-hover:opacity-100
              text-primary
              transition-opacity
            "
                >
                  <CaretRightIcon className="w-5 h-5" weight="bold" />
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
