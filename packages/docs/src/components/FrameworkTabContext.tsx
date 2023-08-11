import { createContext, useContext, type ParentProps } from 'solid-js'
import { createStore } from 'solid-js/store'

export type FrameworkTabId = 'react' | 'solid'

interface FrameworkTabProps {
  activeTabId: FrameworkTabId
}

type FrameworkTabStore = [
  state: FrameworkTabProps,
  actions: {
    changeTab: (tabId: FrameworkTabId) => void
  }
]

const defaultTab: FrameworkTabId = 'react'
export const FrameworkTabContext = createContext<FrameworkTabStore>([
  { activeTabId: defaultTab },
  {
    changeTab: () => {},
  },
])

export function FrameworkTabProvider(props: ParentProps<FrameworkTabProps>) {
  const [state, setState] = createStore({ activeTabId: props.activeTabId || defaultTab })
  const store: FrameworkTabStore = [
    state,
    {
      changeTab(tabId: FrameworkTabId) {
        setState('activeTabId', tabId)
      },
    },
  ]

  return (
    <FrameworkTabContext.Provider value={store}>
      {props.children}
    </FrameworkTabContext.Provider>
  )
}

export function useFrameworkTabs() {
  const [state, { changeTab }] = useContext(FrameworkTabContext)
  return { state, changeTab }
}
