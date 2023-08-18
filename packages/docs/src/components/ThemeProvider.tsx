import { type ParentProps, createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

const THEME_KEY = 'lfgTheme'

export const getInitialTheme = () =>
  localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark'

type Theme = 'light' | 'dark'

interface ThemeProviderProps {
  theme: Theme
}

type ThemeProviderStore = [
  state: ThemeProviderProps,
  actions: {
    changeTheme: (theme: Theme) => void
  }
]

export const ThemeContext = createContext<ThemeProviderStore>([
  { theme: 'dark' },
  {
    changeTheme: () => {},
  },
])

export function ThemeProvider(props: ParentProps<ThemeProviderProps>) {
  const [state, setState] = createStore({ theme: props.theme })
  const store: ThemeProviderStore = [
    state,
    {
      changeTheme(theme: Theme) {
        setState('theme', theme)
        localStorage.setItem(THEME_KEY, theme)
      },
    },
  ]

  return <ThemeContext.Provider value={store}>{props.children}</ThemeContext.Provider>
}

export function useTheme() {
  const [state, { changeTheme }] = useContext(ThemeContext)
  return { state, changeTheme }
}
