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
const ColumnSpanning = lazy(() => import('./docs/ColumnSpanning'))
const RowSorting = lazy(() => import('./docs/RowSorting'))
const RowGrouping = lazy(() => import('./docs/RowGrouping'))
const RowPinning = lazy(() => import('./docs/RowPinning'))
const RowSpanning = lazy(() => import('./docs/RowSpanning'))
const DetailRows = lazy(() => import('./docs/DetailRows'))
const CellEditing = lazy(() => import('./docs/CellEditing'))
const CellSelection = lazy(() => import('./docs/CellSelection'))

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
    case 'columns/spanning':
      return <ColumnSpanning />
    case 'rows/sorting':
      return <RowSorting />
    case 'rows/grouping':
      return <RowGrouping />
    case 'rows/pinning':
      return <RowPinning />
    case 'rows/detail-rows':
      return <DetailRows />
    case 'rows/spanning':
      return <RowSpanning />
    case 'cells/editing':
      return <CellEditing />
    case 'cells/selection':
      return <CellSelection />
    default:
      // TODO: Change to 404
      return <IntroDoc />
  }
}

interface SectionItemProps {
  path: string
  label: string
  isEnterprise?: boolean
}

function SectionItem(props: SectionItemProps) {
  return (
    <li>
      <A
        href={`/docs/${props.path}`}
        class={styles.sectionItem}
        activeClass={styles.sectionItemActive}
      >
        {props.label}
        {props.isEnterprise && <EIcon />}
      </A>
    </li>
  )
}

export function Docs() {
  const location = useLocation()
  const params = useParams<{ slug?: string }>()

  const onBackToTopClick = (e: MouseEvent) => {
    e.preventDefault()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
              <SectionItem path="guides/setup" label="Setup" />
              <SectionItem path="guides/theming" label="Theming" />
              <SectionItem path="guides/global-filtering" label="Global search" />
              <SectionItem path="guides/async-data" label="Async Data" />
              <SectionItem path="guides/pagination" label="Pagination" />
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Columns</li>
              <SectionItem path="columns/defining-columns" label="Defining columns" />
              <SectionItem path="columns/grouping" label="Grouping" />
              <SectionItem path="columns/filtering" label="Filtering" />
              <SectionItem path="columns/pinning" label="Pinning" isEnterprise />
              <SectionItem path="columns/resizing" label="Resizing" isEnterprise />
              <SectionItem path="columns/reordering" label="Reordering" isEnterprise />
              <SectionItem path="columns/spanning" label="Spanning" isEnterprise />
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Rows</li>
              <SectionItem path="rows/sorting" label="Sorting" />
              <SectionItem path="rows/grouping" label="Grouping" />
              <SectionItem path="rows/pinning" label="Pinning" isEnterprise />
              <SectionItem path="rows/detail-rows" label="Detail Rows" isEnterprise />
              <SectionItem path="rows/spanning" label="Spanning" isEnterprise />
            </ul>
            <ul class={styles.docSection}>
              <li class={styles.sectionTitle}>Cells</li>
              <SectionItem path="cells/editing" label="Editing" />
              <SectionItem path="cells/selection" label="Selection" isEnterprise />
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
