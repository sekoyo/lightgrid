import { LightIcon } from './LightIcon'
import { DarkIcon } from './DarkIcon'
import { useTheme } from '../ThemeProvider'

import styles from './ThemeSwitcher.module.css'

export function ThemeSwitcher() {
  const { state, changeTheme } = useTheme()
  return (
    <button
      class={styles.btn}
      title={`Change to ${state.theme === 'dark' ? 'light' : 'dark'}`}
      onClick={() => changeTheme(state.theme === 'dark' ? 'light' : 'dark')}
    >
      {state.theme === 'dark' ? <LightIcon /> : <DarkIcon />}
    </button>
  )
}
