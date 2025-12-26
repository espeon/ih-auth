import { GlobeIcon, CaretRightIcon } from "@phosphor-icons/react";

interface PDSOption {
  url: string;
  name: string;
  description: string;
  icon?: string | React.ComponentType<{ className?: string; weight?: string }>;
  iconDisplay?: "full" | "transparent";
  // background, partially translucent (e.g. "#0f72ec55")
  bg?: string;
}

interface PDSSelectorProps {
  onSelect: (pdsUrl: string) => void;
}

const PDS_OPTIONS: PDSOption[] = [
  {
    url: "https://bsky.social",
    name: "Bluesky",
    description: "The flagship AT Protocol-based social network",
    icon: "./bsky.svg",
    bg: "#0f72ec55",
  },
  {
    url: "https://selfhosted.social",
    name: "Selfhosted Social",
    description: "A friendly and open personal data server",
    icon: "./harvest-moon-cow.webp",
  },
  {
    url: "https://pds.sprk.so",
    name: "Spark",
    description:
      "The Personal Data Server for Spark, a video-focused social app",
    icon: "./spark.jpg",
    iconDisplay: "full",
  },
];

export function PDSSelector({ onSelect }: PDSSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        {PDS_OPTIONS.map((pds, index) => (
          <div
            key={pds.url}
            className="group relative"
            style={{
              animation: `fadeInUp 0.4s ease-out ${index * 0.05}s both`,
            }}
          >
            <button
              onClick={() => onSelect(pds.url)}
              className="
                w-full
                flex items-center gap-3
                px-2 py-2
                bg-card hover:bg-accent
                border border-border hover:border-primary/50
                rounded-xl
                transition-all duration-200
                hover:scale-[1.01] hover:shadow-lg hover:shadow-primary/10
                text-left
              "
            >
              {pds.icon ? (
                typeof pds.icon === "string" ? (
                  pds.iconDisplay === "full" ? (
                    <img
                      src={pds.icon}
                      alt={pds.name}
                      className="max-w-10 max-h-10
                      object-contain
                      rounded-lg
                      h-full"
                    />
                  ) : (
                    <div
                      className="
                    flex items-center justify-center
              w-10 h-10
              rounded-lg
              border border-primary/20
              group-hover:border-primary/40
              transition-colors
              "
                      style={{ backgroundColor: pds.bg || "transparent" }}
                    >
                      <img
                        src={pds.icon}
                        alt={pds.name}
                        className="max-w-8 h-8
                      object-contain
                      rounded-lg
                      w-full"
                      />
                    </div>
                  )
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
                    <pds.icon className="w-5 h-5 text-primary" weight="bold" />
                  </div>
                )
              ) : (
                <div
                  className="
                    flex items-center justify-center
                    w-10 h-10
                    rounded-full
                    bg-gradient-to-br from-primary/20 to-primary/30
                    border border-primary/20
                    group-hover:border-primary/40
                    transition-colors
                  "
                >
                  <GlobeIcon className="w-5 h-5 text-primary" weight="bold" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-sm text-foreground font-medium truncate">
                  {pds.name}
                </div>
                <div className="text-xs text-muted-foreground truncate text-wrap max-w-full">
                  {pds.description}
                </div>
              </div>

              <div className="flex flex-row items-center gap-2">
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
      <a
        href="https://blog.indexx.dev/3lz3kftpf4k25"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-primary hover:underline flex items-center justify-center gap-1 mt-4"
      >
        Other PDS options
        <CaretRightIcon className="w-3 h-3" weight="bold" />
      </a>
    </div>
  );
}
