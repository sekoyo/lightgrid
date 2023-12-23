import {
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
} from "solid-js";
import { CodeBlock, IFrame } from "./DocTypography";

import styles from "./Demo.module.css";
import { cls } from "src/utils/cls";
import { IconButton } from "./IconButton";

interface DemoProps {
  demoUrl: string;
  demoSrc: Promise<typeof import("*?raw")>;
  height?: string;
}

export function Demo(props: DemoProps) {
  const [fullscreen, setFullscreen] = createSignal(false);
  const height = () => (fullscreen() ? "100%" : props.height || "600px");
  const [src, setSrc] = createSignal("");
  const [view, setView] = createSignal<"demo" | "source">("demo");

  createEffect(() => {
    if (view() === "source") {
      props.demoSrc.then((m) => setSrc(m.default));
    }
  });

  createEffect(() => {
    if (fullscreen()) {
      document.body.style.setProperty("overflow", "hidden");
    } else {
      document.body.style.removeProperty("overflow");
    }
    onCleanup(() => document.body.style.removeProperty("overflow"));
  });

  const toggleFullScreen = () => {
    setFullscreen((f) => !f);
  };

  return (
    <div
      class={cls(styles.container, fullscreen() && styles.fullscreenContainer)}
    >
      {view() === "demo" ? (
        <IFrame class={styles.mainView} src={props.demoUrl} height={height()} />
      ) : (
        <div class={styles.mainView} style={{ height: height() }}>
          {!src() ? (
            "Loading..."
          ) : (
            <CodeBlock class={styles.code} lang="typescript">
              {src()}
            </CodeBlock>
          )}
        </div>
      )}
      <div class={styles.demoActions}>
        <button class={styles.switchBtn} onClick={() => toggleFullScreen()}>
          <svg
            viewBox="0 0 469.333 469.333"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            style={{ height: "12px" }}
          >
            <path d="M160 0H10.667A10.66 10.66 0 0 0 0 10.667V160a10.66 10.66 0 0 0 10.667 10.667H32A10.66 10.66 0 0 0 42.667 160V42.667H160A10.66 10.66 0 0 0 170.667 32V10.667A10.66 10.66 0 0 0 160 0zM458.667 0H309.333a10.66 10.66 0 0 0-10.667 10.667V32a10.66 10.66 0 0 0 10.667 10.667h117.333V160a10.66 10.66 0 0 0 10.667 10.667h21.333A10.66 10.66 0 0 0 469.333 160V10.667A10.66 10.66 0 0 0 458.667 0zM458.667 298.667h-21.333a10.66 10.66 0 0 0-10.667 10.667v117.333H309.333a10.66 10.66 0 0 0-10.667 10.667v21.333a10.66 10.66 0 0 0 10.667 10.667h149.333a10.66 10.66 0 0 0 10.667-10.667V309.333a10.66 10.66 0 0 0-10.666-10.666zM160 426.667H42.667V309.333A10.66 10.66 0 0 0 32 298.666H10.667A10.662 10.662 0 0 0 0 309.333v149.333a10.66 10.66 0 0 0 10.667 10.667H160a10.66 10.66 0 0 0 10.667-10.667v-21.333A10.66 10.66 0 0 0 160 426.667z" />
          </svg>
          {fullscreen() ? "Close Fullscreen" : "FullScreen"}
        </button>
        <div class={styles.switchView}>
          <button
            class={styles.switchBtn}
            disabled={view() === "demo"}
            onClick={() => setView("demo")}
          >
            Demo{" "}
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M18.84 2.5H5.16a2.59 2.59 0 0 0-2.59 2.59v13.68a2.59 2.59 0 0 0 2.59 2.59h13.68a2.59 2.59 0 0 0 2.59-2.59V5.09a2.59 2.59 0 0 0-2.59-2.59zm-13.68 1h13.68a1.59 1.59 0 0 1 1.59 1.59v2.52H3.57V5.09A1.59 1.59 0 0 1 5.16 3.5zm9.34 5.11v11.75h-5V8.61zM3.57 18.77V8.61H8.5v11.75H5.16a1.59 1.59 0 0 1-1.59-1.59zm15.27 1.59H15.5V8.61h4.93v10.16a1.59 1.59 0 0 1-1.59 1.59z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            class={styles.switchBtn}
            disabled={view() === "source"}
            onClick={() => setView("source")}
          >
            Source
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="m1.293 12.707 4 4a1 1 0 1 0 1.414-1.414L3.414 12l3.293-3.293a1 1 0 1 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414zM18.707 7.293a1 1 0 1 0-1.414 1.414L20.586 12l-3.293 3.293a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414zM13.039 4.726l-4 14a1 1 0 0 0 .686 1.236A1.053 1.053 0 0 0 10 20a1 1 0 0 0 .961-.726l4-14a1 1 0 1 0-1.922-.548z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
