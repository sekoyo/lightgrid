import { createContext } from 'react'

type Theme = 'light' | 'dark'

export const ThemeContext = createContext<Theme>('dark')
