import React from 'react'
import Link from '@docusaurus/Link'
import { LightgridLogo } from '@site/src/components'

export default function LogoWrapper(props) {
  return (
    <Link to="/" className="header-logo">
      <LightgridLogo style={{ height: 22 }} />
    </Link>
  )
}
