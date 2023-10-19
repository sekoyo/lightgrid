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
  H3,
  Table,
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
      <H1>Defining Columns</H1>
      <Section>
        <P>
          The only required props are <Code>key</Code> and <Code>getValue</Code>.
        </P>
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
          Columns can also be grouped using a <Code>children: []</Code> array. See{' '}
          <A href="/columns/grouping">Column Grouping</A> for a demo.
        </P>
        <CodeBlock lang="typescript">{getNestedColSnippet()}</CodeBlock>
      </Section>
      <Section>
        <H2>Full column definition spec</H2>
        <H3>Columns</H3>
        <Table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                key <em>(required)</em>
              </td>
              <td>string | number</td>
              <td>A unique key for this column. Do not use an array index.</td>
            </tr>
            <tr>
              <td>
                getValue <em>(required)</em>
              </td>
              <td>{'(row: T, source: ValueSource) => any'}</td>
              <td>
                Should return the value for the cell. You can return different values
                depending on the <Code>source</Code> param.
              </td>
            </tr>
            <tr>
              <td>header</td>
              <td>{'<N>'} (Generic for framework node type, see examples above)</td>
              <td>The header text or node for this column.</td>
            </tr>
            <tr>
              <td>width</td>
              <td>string ("100px" or "0.5fr") or number in pixels</td>
              <td>
                The column width. Can be <Code>"10px"</Code> or <Code>10</Code> (pixels),
                or <Code>"0.5fr"</Code>
                (fractional unit). Defaults to <Code>"1fr"</Code>.
              </td>
            </tr>
            <tr>
              <td>minWidth</td>
              <td>number in pixels</td>
              <td>
                The minimum width this column can be, in pixels. Defaults to{' '}
                <Code>100</Code>.
              </td>
            </tr>
            <tr>
              <td>sortable</td>
              <td>boolean</td>
              <td>
                Whether this column can be sorted or not. You must implement the{' '}
                <Code>onColumnsChange</Code> prop for sorting to work.
              </td>
            </tr>
            <tr>
              <td>sortDirection</td>
              <td>enum SortDirection</td>
              <td>
                The current sort direction of this column (or undefined for no sort)
              </td>
            </tr>
            <tr>
              <td>createSortComparator</td>
              <td>{'(sortDirection: SortDirection) => Comparator<T>'}</td>
              <td>
                Given the sort direction, returns a custom comparator function. If not
                defined then the default comparator is used.
              </td>
            </tr>
            <tr>
              <td>sortPriority</td>
              <td>number</td>
              <td>
                The sort priority when multiple columns are sorted. Lower is higher
                priority. By default it's based on the order that columns are clicked.
              </td>
            </tr>
            <tr>
              <td>pin</td>
              <td>ColumnPin</td>
              <td>
                Pin this column to the left (<Code>"start"</Code>) or right (
                <Code>"end"</Code>) if you wish it to always be visible even if the user
                scrolls.
              </td>
            </tr>
            <tr>
              <td>cellComponent</td>
              <td>{'(column: DerivedColumn<T, N>, item: T) => N'}</td>
              <td>
                A function given a the current column and row item returns the cell node
                to be rendered. If not specified will try to render the result of{' '}
                <Code>getValue</Code> as a string.
              </td>
            </tr>
          </tbody>
        </Table>
        <H3>Column Groups</H3>
        <Table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                key <em>(required)</em>
              </td>
              <td>string | number</td>
              <td>A unique key for this column group. Do not use an array index.</td>
            </tr>
            <tr>
              <td>header</td>
              <td>{'<N>'} (Generic for framework node type, see examples above)</td>
              <td>The header text or node for this column group.</td>
            </tr>
            <tr>
              <td>children</td>
              <td>{'GroupedColumns<T, N>'}</td>
              <td>The columns and groups under this group.</td>
            </tr>
            <tr>
              <td>pin</td>
              <td>ColumnPin</td>
              <td>
                Pin this column to the left (<Code>"start"</Code>) or right (
                <Code>"end"</Code>) if you wish it to always be visible even if the user
                scrolls.
              </td>
            </tr>
          </tbody>
        </Table>
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
