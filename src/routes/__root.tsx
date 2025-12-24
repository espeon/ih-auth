import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <div className="absolute left-auto right-2 top-2 inset-0">
        <ThemeSwitcher />
      </div>
      <Outlet />
    </ThemeProvider>
  ),
});
