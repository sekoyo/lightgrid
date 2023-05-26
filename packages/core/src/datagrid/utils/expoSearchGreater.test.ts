import { expect, test } from 'vitest'

import { expoSearchGreater } from './expoSearchGreater'

test('expoSearchGreater', () => {
  const values1 = [1, 4, 6, 13, 16, 26, 27, 29, 34, 38, 40, 47, 55]
  const index1 = expoSearchGreater(values1, 13, v => v, 2)
  expect(index1).toEqual(4) // 0..4 = 16

  const values2 = [1, 4, 6, 13, 16, 26, 27, 29, 34, 38, 40, 47, 55]
  const index2 = expoSearchGreater(values2, 13, v => v, 1)
  expect(index2).toEqual(6) // 0..2..6 = 27
})
