export function dedent(str: string) {
  const lines = str.trimEnd().split('\n') // Split the raw string into lines

  // Remove leading empty lines
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim()) {
      lines.splice(i, 1)
      i--
    } else {
      break
    }
  }

  // Find the minimum number of leading spaces across all lines
  const minLeadingSpaces = lines.reduce((acc, line) => {
    if (!line.trim()) {
      return acc
    }
    // Find the number of leading spaces for this line
    const leadingSpaces = line.match(/^ */)?.[0].length ?? 0
    // if it has less leading spaces than the previous minimum, set it as the new minimum
    return leadingSpaces < acc ? leadingSpaces : acc
  }, Infinity)

  console.log({ minLeadingSpaces })

  // Trim lines, join them and return the result
  return lines.map(line => line.substring(minLeadingSpaces)).join('\n')
}
