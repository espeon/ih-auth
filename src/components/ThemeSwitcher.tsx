import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon, CircleIcon } from "@phosphor-icons/react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light" as const, icon: SunIcon, label: "Light" },
    { value: "dark" as const, icon: MoonIcon, label: "Dark" },
    { value: "system" as const, icon: CircleIcon, label: "System" },
  ];

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-lg border border-border">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            p-2 rounded-md
            transition-all
            ${
              theme === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }
          `}
          aria-label={`Switch to ${label} theme`}
          title={`${label} theme`}
        >
          <Icon className="w-4 h-4" weight="bold" />
        </button>
      ))}
    </div>
  );
}
