import { splitProps, type JSX, type ParentProps } from 'solid-js'
import { cls } from 'src/utils/cls'
import styles from './ContentContainer.module.css'

export function ContentContainer(props: ParentProps<JSX.HTMLAttributes<HTMLDivElement>>) {
  const [, attrs] = splitProps(props, ['children'])
  return (
    <div {...attrs} class={cls(styles.container, attrs.class)}>
      {props.children}
    </div>
  )
}
