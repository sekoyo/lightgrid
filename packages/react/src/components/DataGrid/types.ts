import { type ReactNode } from 'react'
import * as CoreTypes from '@lightgrid/core'
export * from '@lightgrid/core'

export type N = ReactNode

// Re-export but with N defined
export type ColumnGroup<T, S = unknown> = CoreTypes.ColumnGroup<T, N, S>
export type CellComponentProps<T, S = unknown> = CoreTypes.CellComponentProps<
  T,
  N,
  S
>
export type Column<T, S = unknown> = CoreTypes.Column<T, N, S>
export type ColumnOrGroup<T, S = unknown> = CoreTypes.ColumnOrGroup<T, N, S>
export type GroupedColumns<T, S = unknown> = CoreTypes.GroupedColumns<T, N, S>
export type DerivedColumn<T, S = unknown> = CoreTypes.DerivedColumn<T, N, S>

export type OnFiltersChange<T> = CoreTypes.OnFiltersChange<T, N>

export type RenderRowDetails<T> = CoreTypes.RenderRowDetails<T, N>
