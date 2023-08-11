import { For, ParentProps, type JSX, createMemo } from 'solid-js'
import styles from './Tabs.module.css'

interface TabButtonProps<T> {
  tabId: T
  isActive?: boolean
  onTabPress: (tabId: T) => void
}
function TabButton<T>(props: ParentProps<TabButtonProps<T>>) {
  return (
    <button
      class={styles.tabButton}
      data-active={props.isActive}
      onClick={() => props.onTabPress(props.tabId)}
    >
      {props.children}
    </button>
  )
}

interface Tab<T> {
  id: T
  label: JSX.Element
  component: JSX.Element
}

interface TabsProps<T> {
  activeTabId: string
  onTabPress: (tabId: T) => void
  children: Tab<T>[]
}
export function Tabs<T>(props: TabsProps<T>) {
  const activeTabContent = createMemo(
    () =>
      props.children.find(item => item.id === props.activeTabId) || props.children.at(0)
  )

  return (
    <div class={styles.container}>
      <header class={styles.tabHeader}>
        <For each={props.children}>
          {item => (
            <TabButton<T>
              tabId={item.id}
              isActive={props.activeTabId === item.id}
              onTabPress={props.onTabPress}
            >
              {item.label}
            </TabButton>
          )}
        </For>
      </header>
      <div class={styles.tabContent}>{activeTabContent()?.component}</div>
    </div>
  )
}
