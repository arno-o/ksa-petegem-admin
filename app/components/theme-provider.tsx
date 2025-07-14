import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme | null
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  useEffect(() => {
    const root = window.document.documentElement

    root.classList.remove("light", "dark")

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = (themeValue: Theme) => {
      if (themeValue === "system") {
        root.classList.add(systemTheme.matches ? "dark" : "light")
      } else {
        root.classList.add(themeValue)
      }
    }

    applyTheme(theme); // Apply initial theme

    // Listen for system theme changes if current theme is "system"
    const mediaQueryListener = (event: MediaQueryListEvent) => {
      if (theme === "system") {
        root.classList.remove("light", "dark")
        root.classList.add(event.matches ? "dark" : "light")
      }
    }

    systemTheme.addEventListener("change", mediaQueryListener)

    // Clean up the event listener when the component unmounts
    return () => {
      systemTheme.removeEventListener("change", mediaQueryListener)
    }

  }, [theme]) // Depend on 'theme' so the effect re-runs if the user manually changes theme

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}