import { useEffect, useState } from 'react'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useColorMode } from '@docusaurus/theme-common'
import { cls } from '@site/src/utils'

import styles from './Demo.module.css'

interface DemoProps {
  demoPath: string
  srcPath: string
  height?: string
}

export function Demo({ demoPath, srcPath, height }: DemoProps) {
  const {
    siteConfig: { customFields },
  } = useDocusaurusContext()
  const { colorMode } = useColorMode()
  const [fullscreen, setFullscreen] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const resolvedHeight = fullscreen ? '100%' : height || '420px'

  useEffect(() => {
    if (fullscreen) {
      document.body.style.setProperty('overflow', 'hidden')
    } else {
      document.body.style.removeProperty('overflow')
    }
    return () => {
      document.body.style.removeProperty('overflow')
    }
  }, [fullscreen])

  const onLoad = () => {
    setLoaded(true)
  }

  const toggleFullScreen = () => {
    setFullscreen(f => !f)
  }

  const demoUrl = `${
    customFields.reactDemoBase
  }/demos/${demoPath}?theme=${colorMode}&height=${encodeURIComponent(
    resolvedHeight
  )}`
  const srcUrl = `https://github.com/lightgridjs/lightgrid/tree/master/packages/react/src/demos/${srcPath}`
  const loadingColor = colorMode === 'dark' ? '#fff' : '#000'

  return (
    <div
      className={cls(
        styles.container,
        fullscreen && styles.fullscreenContainer
      )}
    >
      <div className={styles.iframeWrapper}>
        <iframe
          className={styles.iframe}
          src={demoUrl}
          height={resolvedHeight}
          onLoad={onLoad}
        />
        {!loaded && (
          <div className={styles.iframeLoader}>
            <svg
              width="38"
              height="38"
              viewBox="0 0 38 38"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  x1="8.042%"
                  y1="0%"
                  x2="65.682%"
                  y2="23.865%"
                  id="a"
                >
                  <stop stopColor={loadingColor} stopOpacity="0" offset="0%" />
                  <stop
                    stopColor={loadingColor}
                    stopOpacity=".631"
                    offset="63.146%"
                  />
                  <stop stopColor={loadingColor} offset="100%" />
                </linearGradient>
              </defs>
              <g fill="none" fillRule="evenodd">
                <g transform="translate(1 1)">
                  <path
                    d="M36 18c0-9.94-8.06-18-18-18"
                    id="Oval-2"
                    stroke="url(#a)"
                    strokeWidth="2"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 18 18"
                      to="360 18 18"
                      dur="0.9s"
                      repeatCount="indefinite"
                    />
                  </path>
                  <circle fill="#fff" cx="36" cy="18" r="1">
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 18 18"
                      to="360 18 18"
                      dur="0.9s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </g>
            </svg>
          </div>
        )}
      </div>
      <div className={styles.demoActions}>
        <button className={styles.btn} onClick={() => toggleFullScreen()}>
          <svg
            className={styles.btnSvg}
            viewBox="0 0 469.333 469.333"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            style={{ height: '12px' }}
          >
            <path d="M160 0H10.667A10.66 10.66 0 0 0 0 10.667V160a10.66 10.66 0 0 0 10.667 10.667H32A10.66 10.66 0 0 0 42.667 160V42.667H160A10.66 10.66 0 0 0 170.667 32V10.667A10.66 10.66 0 0 0 160 0zM458.667 0H309.333a10.66 10.66 0 0 0-10.667 10.667V32a10.66 10.66 0 0 0 10.667 10.667h117.333V160a10.66 10.66 0 0 0 10.667 10.667h21.333A10.66 10.66 0 0 0 469.333 160V10.667A10.66 10.66 0 0 0 458.667 0zM458.667 298.667h-21.333a10.66 10.66 0 0 0-10.667 10.667v117.333H309.333a10.66 10.66 0 0 0-10.667 10.667v21.333a10.66 10.66 0 0 0 10.667 10.667h149.333a10.66 10.66 0 0 0 10.667-10.667V309.333a10.66 10.66 0 0 0-10.666-10.666zM160 426.667H42.667V309.333A10.66 10.66 0 0 0 32 298.666H10.667A10.662 10.662 0 0 0 0 309.333v149.333a10.66 10.66 0 0 0 10.667 10.667H160a10.66 10.66 0 0 0 10.667-10.667v-21.333A10.66 10.66 0 0 0 160 426.667z" />
          </svg>
          {fullscreen ? 'Close Fullscreen' : 'FullScreen'}
        </button>
        <a href={srcUrl} className={styles.btn} target="_blank">
          <svg
            className={styles.btnSvg}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m1.293 12.707 4 4a1 1 0 1 0 1.414-1.414L3.414 12l3.293-3.293a1 1 0 1 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414zM18.707 7.293a1 1 0 1 0-1.414 1.414L20.586 12l-3.293 3.293a1 1 0 1 0 1.414 1.414l4-4a1 1 0 0 0 0-1.414zM13.039 4.726l-4 14a1 1 0 0 0 .686 1.236A1.053 1.053 0 0 0 10 20a1 1 0 0 0 .961-.726l4-14a1 1 0 1 0-1.922-.548z"
              fill="currentColor"
            />
          </svg>
          View Source
        </a>
      </div>
    </div>
  )
}
