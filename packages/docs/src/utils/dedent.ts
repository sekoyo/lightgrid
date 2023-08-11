export function dedent(str: string) {
  const lines = str
    .trimEnd()
    .split('\n') // Split the raw string into lines
    .filter(line => line !== '') // remove empty lines

  // Find the minimum number of leading spaces across all lines
  const minLeadingSpaces = lines.reduce((acc, line) => {
    // Find the number of leading spaces for this line
    const leadingSpaces = line.match(/^ */)?.[0].length ?? 0
    // if it has less leading spaces than the previous minimum, set it as the new minimum
    return leadingSpaces < acc ? leadingSpaces : acc
  }, Infinity)

  // Trim lines, join them and return the result
  return lines.map(line => line.substring(minLeadingSpaces)).join('\n')
}
