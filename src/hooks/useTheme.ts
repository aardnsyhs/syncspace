import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "syncspace-theme";

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(
    theme === "system" ? getSystemTheme() : theme
  );

  // Apply theme on mount and when theme changes
  useEffect(() => {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? "dark" : "light";
      setResolvedTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback(
    (newTheme: Theme, _event?: React.MouseEvent) => {
      const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
      const currentResolved = theme === "system" ? getSystemTheme() : theme;

      // Check if View Transitions API is supported and theme actually changes
      if (
        "startViewTransition" in document &&
        typeof document.startViewTransition === "function" &&
        resolved !== currentResolved
      ) {
        // Paint spill animation: always from top-right to bottom-left
        // Calculate diagonal distance for full coverage
        const diagonal = Math.hypot(window.innerWidth, window.innerHeight);

        // Set CSS custom properties for the animation
        document.documentElement.style.setProperty(
          "--theme-diagonal",
          `${diagonal}px`
        );

        // Add direction class for CSS to know which way to animate
        document.documentElement.classList.add(
          resolved === "dark" ? "theme-to-dark" : "theme-to-light"
        );

        // Start the view transition
        const transition = document.startViewTransition(() => {
          setThemeState(newTheme);
          setResolvedTheme(resolved);
          applyTheme(resolved);
          localStorage.setItem(STORAGE_KEY, newTheme);
        });

        // Clean up direction class after animation
        transition.finished.then(() => {
          document.documentElement.classList.remove(
            "theme-to-dark",
            "theme-to-light"
          );
        });
      } else {
        // Fallback for browsers without View Transitions API
        setThemeState(newTheme);
      }
    },
    [theme]
  );

  const toggleTheme = useCallback(
    (event?: React.MouseEvent) => {
      const newTheme = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(newTheme, event);
    },
    [resolvedTheme, setTheme]
  );

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
  };
}
