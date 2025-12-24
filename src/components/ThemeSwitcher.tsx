import { useTheme } from "./ThemeProvider";
import { MoonIcon, SunIcon, CircleIcon } from "@phosphor-icons/react";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const getIcon = () => {
    if (theme === "system") return CircleIcon;
    if (theme === "dark") return MoonIcon;
    return SunIcon;
  };

  const getLabel = () => {
    if (theme === "system") return "System";
    if (theme === "dark") return "Dark";
    return "Light";
  };

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const Icon = getIcon();
  const label = getLabel();

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center p-2 bg-muted rounded-lg border border-border hover:bg-background/50 transition-all text-foreground"
      aria-label={`Switch to ${label} theme`}
      title={`${label} theme`}
    >
      <Icon className="w-4 h-4" weight="bold" />
    </button>
  );
}
