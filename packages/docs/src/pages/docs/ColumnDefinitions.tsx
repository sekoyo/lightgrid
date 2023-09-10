import {
  Code,
  CodeBlock,
  H1,
  P,
  PageButton,
  HGroup,
  Section,
  H2,
  A,
} from 'src/components/DocTypography'
import { useFrameworkTabs } from 'src/components/FrameworkTabContext'
import { Tabs } from 'src/components/Tabs'

const getFlatColSnippet = (framework: 'react' | 'solid') =>
  `
    import { GroupedColumns, ValueSource } from '@lightfin/datagrid'

    type N = ${framework === 'react' ? 'React.ReactNode' : 'JSX.Element'}

    interface CryptoCurrency {
      rank: number,
      name: string,
      symbol: string,
      marketCap: string,
      lastPrice: number,
      volume24h: number,
      priceChange1h: number,
      priceChange7h: number,
      priceChange24h: number,
      priceChange7d: number,
    }

    const columns = GroupedColumns<CryptoCurrency, N> = [
      {
        key: 'rank',
        header: <em>Rank</em>.
        getValue: d => d.rank,
        width: 90,
      },
      {
        key: 'symbol',
        header: 'Symbol',
        getValue: d => d.symbol,
        cellComponent: (column, item) => <CryptoSymbol symbol={d.symbol} />
      },
      {
        key: 'marketCap',
        getValue: (d, source) => source === ValueSource.Cell ?
          formatCCY('USD', d.marketCap) : d.marketCap,
      },
      {
        key: 'lastPrice',
        getValue: (d, source) => source === ValueSource.Cell ?
          formatCCY(d.symbol, d.lastPrice) : d.lastPrice,
      },
      {
        key: 'priceChange24h',
        header: '% 24h',
        getValue: (d, source) => source === ValueSource.Cell ?
          \`\${priceChange24h}%\` : d.priceChange24h,
      }
    ]
  `

const getNestedColSnippet = () =>
  `
    const columns = GroupedColumns<CryptoCurrency, N> = [
      ...,
      {
        key: 'priceChangeGroup',
        header: 'Price change',
        children: [
          {
            key: 'priceChange1h',
            header: '% 1h',
            getValue: (d, source) => source === ValueSource.Cell ?
              \`\${priceChange1h}%\` : d.priceChange1h,
          },
          {
            key: 'priceChange7h',
            header: '% 7h',
            getValue: (d, source) => source === ValueSource.Cell ?
              \`\${priceChange7h}%\` : d.priceChange7h,
          },
          {
            key: 'priceChange24h',
            header: '% 24h',
            getValue: (d, source) => source === ValueSource.Cell ?
              \`\${priceChange24h}%\` : d.priceChange24h,
          },
          {
            key: 'priceChange7d',
            header: '% 7d',
            getValue: (d, source) => source === ValueSource.Cell ?
              \`\${priceChange7d}%\` : d.priceChange7d,
          }
        ]
      }
    ]
  `

export default function Doc() {
  const { state, changeTab } = useFrameworkTabs()

  return (
    <div>
      <H1>Column Definitions</H1>
      <Section>
        <P>
          Columns (and column groups) are passed in via the{' '}
          <Code>columns: {'GroupedColumns<T, N>'}</Code> array prop. Where <Code>T</Code>{' '}
          is the shape of your row data and <Code>N</Code> is a node type for your chosen
          framework (e.g. <Code>React.ReactNode</Code> for React or{' '}
          <Code>JSX.Element</Code> for Solid).
        </P>
        <P>
          The only required props are <Code>key</Code> and <Code>getValue</Code>.
        </P>
        <P>This can be as a simple list of columns:</P>
        <Tabs activeTabId={state.activeTabId} onTabPress={changeTab}>
          {[
            {
              id: 'react',
              label: 'React',
              component: (
                <CodeBlock lang="typescript">{getFlatColSnippet('react')}</CodeBlock>
              ),
            },
            {
              id: 'solid',
              label: 'Solid',
              component: (
                <CodeBlock lang="typescript">{getFlatColSnippet('solid')}</CodeBlock>
              ),
            },
          ]}
        </Tabs>
      </Section>
      <Section>
        <H2>Column Grouping</H2>
        <P>
          Columns can also be grouped (and nested) using a{' '}
          <Code>{'ColumnGroup<T, N>'}</Code> and its <Code>children: []</Code> array. For
          a demo checkout <A href="/columns/grouping">Column Grouping</A>.
        </P>
        <CodeBlock lang="typescript">{getNestedColSnippet()}</CodeBlock>
      </Section>
      <Section>
        <H2>Full definition spec</H2>
      </Section>
      <HGroup justifyEnd>
        <PageButton href="/docs/guides/pagination" secondaryLabel="Previous">
          Pagination
        </PageButton>
        <PageButton href="/docs/guides/global-search" secondaryLabel="Next">
          Grouping
        </PageButton>
      </HGroup>
    </div>
  )
}
