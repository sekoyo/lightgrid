import { A, useParams, useLocation } from '@solidjs/router'
import { lazy } from 'solid-js'

import { cls } from 'src/utils/cls'
import { AppShell } from 'src/components/AppShell'
import { DoubleArrowUp } from 'src/components/Icons'
import { EIcon } from 'src/components/DocTypography'
import styles from './Docs.module.css'

const IntroDoc = lazy(() => import('./docs/Intro'))
const Setup = lazy(() => import('./docs/Setup'))
const Theming = lazy(() => import('./docs/Theming'))
const GlobalFiltering = lazy(() => import('./docs/GlobalFiltering'))
const AsyncData = lazy(() => import('./docs/AsyncData'))
const Pagination = lazy(() => import('./docs/Pagination'))
const ColumnDefinitions = lazy(() => import('./docs/ColumnDefinitions'))
const ColumnGrouping = lazy(() => import('./docs/ColumnGrouping'))
const ColumnFiltering = lazy(() => import('./docs/ColumnFiltering'))
const ColumnPinning = lazy(() => import('./docs/ColumnPinning'))
const ColumnResizing = lazy(() => import('./docs/ColumnResizing'))
const ColumnReordering = lazy(() => import('./docs/ColumnReordering'))
const RowSorting = lazy(() => import('./docs/RowSorting'))
const RowGrouping = lazy(() => import('./docs/RowGrouping'))
const RowPinning = lazy(() => import('./docs/RowPinning'))
const DetailRows = lazy(() => import('./docs/DetailRows'))
const CellEditing = lazy(() => import('./docs/CellEditing'))

function getDocPage(slug?: string) {
  switch (slug) {
    case 'guides/setup':
      return <Setup />
    case 'guides/theming':
      return <Theming />
    case 'guides/global-filtering':
      return <GlobalFiltering />
    case 'guides/async-data':
      return <AsyncData />
    case 'guides/pagination':
      return <Pagination />
    case 'columns/defining-columns':
      return <ColumnDefinitions />
    case 'columns/grouping':
      return <ColumnGrouping />
    case 'columns/filtering':
      return <ColumnFiltering />
    case 'columns/pinning':
      return <ColumnPinning />
    case 'columns/resizing':
      return <ColumnResizing />
    case 'columns/reordering':
      return <ColumnReordering />
    case 'rows/sorting':
      return <RowSorting />
    case 'rows/grouping':
      return <RowGrouping />
    case 'rows/pinning':
      return <RowPinning />
    case 'rows/detail-rows':
      return <DetailRows />
    case 'cells/editing':
      return <CellEditing />
    default:
      // TODO: Change to 404
      return <IntroDoc />
  }
}

export function Docs() {
  const location = useLocation()
  const params = useParams<{ slug?: string }>()

  const onBackToTopClick = (e: MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sectionItem = (path: string, label: string, isEnterprise?: boolean) => (
    <li>
      <A
        href={`/docs/${path}`}
        class={styles.sectionItem}
        activeClass={styles.sectionItemActive}
      >
        {label}
        {isEnterprise && <EIcon />}
      </A>
    </li>
  )
  console.log({ location })
  return (
    <AppShell>
      <div class={styles.layout}>
        {/*div is for position sticky to work on sidebar*/}
        <div>
          <div class={styles.sidebar}>
            <ul class={styles.docSection}>
              <li>
                <A
                  href="/docs/"
                  class={cls(
                    styles.sectionItem,
                    (location.pathname === '/docs' || location.pathname === '/docs/') &&
                      styles.sectionItemActive
                  )}
                >
                  Intro
                </A>
              </li>
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Guides</li>
              {sectionItem('guides/setup', 'Setup')}
              {sectionItem('guides/theming', 'Theming')}
              {sectionItem('guides/global-filtering', 'Global filtering (search)')}
              {sectionItem('guides/async-data', 'Async Data')}
              {sectionItem('guides/pagination', 'Pagination')}
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Columns</li>
              {sectionItem('columns/defining-columns', 'Defining Columns')}
              {sectionItem('columns/grouping', 'Grouping')}
              {sectionItem('columns/filtering', 'Filtering')}
              {sectionItem('columns/pinning', 'Pinning', true)}
              {sectionItem('columns/resizing', 'Resizing', true)}
              {sectionItem('columns/reordering', 'Reordering', true)}
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Rows</li>
              {sectionItem('rows/sorting', 'Row Sorting')}
              {sectionItem('rows/grouping', 'Grouping')}
              {sectionItem('rows/pinning', 'Pinning', true)}
              {sectionItem('rows/detail-rows', 'Detail Rows', true)}
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Cells</li>
              {sectionItem('cells/editing', 'Cell editing')}
              {sectionItem('cells/selection', 'Cell selection', true)}
            </ul>
            <a
              class={styles.toTopBtn}
              href="#top"
              title="Back to the top"
              onClick={onBackToTopClick}
            >
              <DoubleArrowUp />
            </a>
          </div>
        </div>
        <main class={styles.docContent}>{getDocPage(params.slug)}</main>
      </div>
    </AppShell>
  )
}
