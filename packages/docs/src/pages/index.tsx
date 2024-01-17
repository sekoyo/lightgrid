import { useEffect, useState, useRef } from 'react'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { HtmlClassNameProvider } from '@docusaurus/theme-common'
import useLayoutEffect from '@docusaurus/useIsomorphicLayoutEffect'
import Link from '@docusaurus/Link'
import Layout from '@theme/Layout'
import { useColorMode } from '@docusaurus/theme-common'
import {
  DataGrid,
  GroupedColumns,
  Theme,
  CellComponentProps,
  darkTheme,
} from '@lightgrid/react'

import { cls } from '../utils'
import {
  AngularIcon,
  InfernoIcon,
  LitIcon,
  PreactIcon,
  ReactIcon,
  UpArrowIcon,
  VueIcon,
} from '../components'

import '@lightgrid/react/dist/style.css'
import styles from './index.module.css'

type Market = {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  fully_diluted_valuation: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  price_change_percentage_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: null | number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  roi: null | {
    times: number
    currency: string
    percentage: number
  }
  last_updated: string
}

const lang = typeof navigator !== 'undefined' ? navigator.language : 'en-US'

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const ccy = new Intl.NumberFormat(lang, {
  maximumFractionDigits: 8,
}).format

const shortNum = Intl.NumberFormat(lang, { notation: 'compact' }).format

function getPriceDirection(n: number) {
  if (n === 0) {
    return undefined
  }
  return n > 0 ? 'positive' : 'negative'
}

function getPriceCssVar(n: number) {
  if (n === 0) {
    return 'var(--ifm-color-content)'
  }
  return n > 0 ? 'var(--positiveColor)' : 'var(--negativeColor)'
}

const visiblePoints = 24

function CurrentPriceCell({ item }: CellComponentProps<Market>) {
  const lastValueRef = useRef(item.current_price)
  const elRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (lastValueRef.current !== item.current_price) {
      const el = elRef.current
      if (el && el.animate) {
        el.animate(
          [
            {
              backgroundColor:
                item.current_price > lastValueRef.current
                  ? 'var(--positiveColor)'
                  : 'var(--negativeColor)',
            },
            { backgroundColor: 'transparent' },
          ],
          300
        )
      }
      lastValueRef.current = item.current_price
    }
  }, [item.current_price])
  return (
    <div ref={elRef} className={cls('lg-default-cell', styles.numberText)}>
      ${ccy(item.current_price)}
    </div>
  )
}

function SparklineCell({ item }: CellComponentProps<Market>) {
  const [startPos, setStartPos] = useState(0)
  const itemLen = item.sparkline_in_7d.price.length
  useEffect(() => {
    const interval = setInterval(() => {
      setStartPos(pos => {
        if (pos + visiblePoints >= itemLen) {
          console.log('max reached', pos, pos + visiblePoints)
          return 0
        }
        return pos + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [itemLen])

  const data = item.sparkline_in_7d.price.slice(
    startPos,
    startPos + visiblePoints
  )

  return (
    <Sparklines
      data={data}
      width={80}
      height={30}
      style={{ margin: '0 var(--lgCellHPadding)', height: 30 }}
    >
      <SparklinesLine
        color={getPriceCssVar(item.price_change_percentage_24h)}
      />
    </Sparklines>
  )
}

const initialColumns: GroupedColumns<Market> = [
  {
    key: 'symbol',
    header: 'Symbol',
    sortable: true,
    getValue: d => d.symbol,
    cellComponent: ({ item }) => (
      <div className={styles.symbolCell}>
        <img src={item.image} alt={item.symbol} className={styles.ccyIcon} />
        <span className={styles.overflowText}>{item.symbol.toUpperCase()}</span>
      </div>
    ),
  },
  {
    key: 'market_cap',
    header: 'Market Cap',
    sortable: true,
    getValue: d => d.market_cap,
    cellComponent: ({ item }) => (
      <div className={cls('lg-default-cell', styles.numberText)}>
        ${shortNum(item.market_cap)}
      </div>
    ),
  },
  {
    key: 'price',
    header: 'Current Price',
    sortable: true,
    getValue: d => d.current_price,
    cellComponent: CurrentPriceCell,
  },
  {
    key: 'low_24h',
    header: '24h Low',
    sortable: true,
    getValue: d => d.low_24h,
    cellComponent: ({ item }) => (
      <div className={cls('lg-default-cell', styles.numberText)}>
        ${ccy(item.low_24h)}
      </div>
    ),
  },
  {
    key: 'high_24h',
    header: '24h High',
    sortable: true,
    getValue: d => d.high_24h,
    cellComponent: ({ item }) => (
      <div className={cls('lg-default-cell', styles.numberText)}>
        ${ccy(item.high_24h)}
      </div>
    ),
  },
  {
    key: 'change_24h',
    header: '24h Change',
    sortable: true,
    getValue: d => d.price_change_percentage_24h,
    cellComponent: ({ item }) => (
      <div
        className={cls(
          'lg-default-cell',
          styles.numberText,
          styles.change24Cell
        )}
        data-direction={getPriceDirection(item.price_change_percentage_24h)}
      >
        {item.price_change_percentage_24h !== 0 && (
          <UpArrowIcon
            style={{
              height: 10,
              transform:
                item.price_change_percentage_24h < 0
                  ? `rotate(180deg)`
                  : undefined,
            }}
          />
        )}
        {Math.abs(item.price_change_percentage_24h)}%
      </div>
    ),
  },
  {
    key: 'price_24h',
    header: '24h Price',
    sortable: true,
    width: 100,
    getValue: d => JSON.stringify(d.sparkline_in_7d.price.slice(0, 24)),
    cellComponent: SparklineCell,
  },
]

const darkTransTheme: Theme = {
  ...darkTheme,
  bg: 'rgba(17 19 21 / 0.65)',
  cellEvenBg: 'rgba(23 24 26 / 0.65)',
  cellOddBg: 'rgba(17 19 21 / 0.65)',
  filterCellBg: 'rgba(17 19 21 / 0.65)',
  headerBorderColor: 'rgba(47 50 51 / 0.65)',
  borderColor: 'rgba(47 50 51 / 0.65)',
}

// Need to nest so ColorModeProvider works :/
function Content() {
  const { siteConfig } = useDocusaurusContext()
  const { functionsBase } = siteConfig.customFields
  const [columns, setColumns] = useState(initialColumns)
  const [markets, setMarkets] = useState<Market[]>([])
  const { setColorMode } = useColorMode()

  useLayoutEffect(() => {
    // Not ideal but not sure there's a better way since ColorModeProvider doesn't
    // provide a way to pass a value.
    setColorMode('dark')
  }, [])

  useEffect(() => {
    fetch('/api/top-cryptos')
      .then(r => r.json() as Promise<Market[]>)
      .then(setMarkets)
      .catch(err => {
        console.error(err)
        return import('../components/marketsFallback.json').then(m =>
          setMarkets(m.default)
        )
      })
  }, [functionsBase])

  // Randomly change current price
  useEffect(() => {
    let timeout

    function changeData() {
      setMarkets(markets => {
        if (markets.length) {
          const idx = randomInt(0, markets.length - 1)
          const newMarkets = [...markets]
          const amount = Number((Math.random() * 40).toFixed(2))
          if (Math.random() > 0.5) {
            newMarkets[idx].current_price += amount
          } else {
            newMarkets[idx].current_price -= amount
          }
          return newMarkets
        }
        return markets
      })
      timeout = setTimeout(changeData, Math.floor(100 + Math.random() * 600))
    }

    timeout = setTimeout(changeData, Math.floor(100 + Math.random() * 600))
    return () => clearInterval(timeout)
  }, [])

  return (
    <main className={styles.container}>
      <div className={styles.banner}>
        <h1 className={styles.pageTitle}>One Datagrid to rule them all</h1>
        <h2 className={styles.subTitle}>
          Finally a datagrid that combines ease of use, performance, bundle
          size, and speed
        </h2>
      </div>
      <div className={styles.features}>
        <div className={styles.feature}>
          <h3 className={styles.featureTitle}>🪽 Lightweight</h3>
          <div className={styles.featureBody}>
            {'<'}25kb gzip with all (lazy loaded) plugins enabled
          </div>
        </div>
        <div className={styles.feature}>
          <h3 className={styles.featureTitle}>⚡️ Lightning fast</h3>
          <div className={styles.featureBody}>
            Built for performance. Smooth and fully virtualized
          </div>
        </div>
        <div className={styles.feature}>
          <h3 className={styles.featureTitle}>🤯 Headless</h3>
          <div className={styles.featureBody}>
            Shared logic with native rendering per framework
          </div>
        </div>
        <div className={styles.feature}>
          <h3 className={styles.featureTitle}>⚱️ Feature rich</h3>
          <div className={styles.featureBody}>
            All the enterprise features without the bloat
          </div>
        </div>
        <div className={styles.feature}>
          <h3 className={styles.featureTitle}>🧠 Declarative</h3>
          <div className={styles.featureBody}>
            Stateless, declarative, simple API. Bring your own UI.
          </div>
        </div>
        <div className={styles.feature}>
          <h3 className={styles.featureTitle}>🚦 Typesafe</h3>
          <div className={styles.featureBody}>
            Built with and for strict Typescript
          </div>
        </div>
      </div>
      <div className={styles.datagridContainer}>
        <DataGrid<Market>
          className={styles.datagrid}
          columns={columns}
          onColumnsChange={setColumns}
          data={markets}
          getRowId={d => d.id}
          theme={darkTransTheme}
        />
      </div>
      <div className={cls(styles.tertiaryText, styles.dataFootnote)}>
        Data for demonstration purposes and may not be accurate
      </div>
      <div className={styles.frameworksWrapper}>
        <div className={styles.frameworks}>
          <div className={styles.framework}>
            <ReactIcon height={28} />
            React
          </div>
          <div className={styles.framework}>
            <PreactIcon height={28} />
            Preact
          </div>
          <div className={styles.framework}>
            <VueIcon height={24} />
            Vue
          </div>
          <div className={styles.framework}>
            <LitIcon height={28} />
            Lit
          </div>
          <div className={styles.framework}>
            <AngularIcon height={28} />
            Angular
          </div>
          <div className={styles.framework}>
            <InfernoIcon height={28} />
            Inferno
          </div>
        </div>
      </div>
      <div className={styles.ctaContainer}>
        <Link to="/docs" className={styles.ctaBtnLink}>
          Get started
        </Link>
      </div>
    </main>
  )
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext()

  return (
    <HtmlClassNameProvider className={styles.html}>
      <Layout
        title={`Hello from ${siteConfig.title}`}
        description="A fast, lightweight, full-featured headless Datagrid for React and more"
      >
        <Content />
      </Layout>
    </HtmlClassNameProvider>
  )
}
