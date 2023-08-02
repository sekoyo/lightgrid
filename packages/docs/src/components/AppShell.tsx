import type { ParentProps } from 'solid-js'
import { A } from '@solidjs/router'

import { ContentContainer } from './ContentContainer'
import { LightfinDatagridLogo } from './LightfinDatagridLogo'

import styles from './AppShell.module.css'

export function AppShell(props: ParentProps) {
  return (
    <div class={styles.container}>
      <div id="top" />
      <header class={styles.header}>
        <ContentContainer class="h-flex p-2 gap-1">
          <A href="/" class={styles.logoLink}>
            <LightfinDatagridLogo class={styles.logo} />
          </A>
          <div class="h-flex gap-2">
            <nav class={styles.nav}>
              <A class={styles.navLink} href="/" end activeClass={styles.navLinkActive}>
                Home
              </A>
              <A
                class={styles.navLink}
                href="/pricing"
                activeClass={styles.navLinkActive}
              >
                Pricing
              </A>
              <A class={styles.navLink} href="/docs" activeClass={styles.navLinkActive}>
                Docs
              </A>
            </nav>
          </div>
        </ContentContainer>
      </header>
      <ContentContainer class={styles.content}>{props.children}</ContentContainer>
    </div>
  )
}
