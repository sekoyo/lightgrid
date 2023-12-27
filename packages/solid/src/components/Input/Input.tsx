import { type JSX } from "solid-js";
import { cls } from "@lightfin/datagrid";
import styles from "./Input.module.css";

export function Input(attrs: JSX.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...attrs} class={cls(styles.input, attrs.class)} />;
}
