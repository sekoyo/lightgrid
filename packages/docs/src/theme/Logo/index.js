import React from 'react'
import Link from '@docusaurus/Link'
import { LightgridLogo } from '@site/src/components'

export default function LogoWrapper(props) {
  return (
    <Link
      to="/"
      style={{ display: 'flex', alignItems: 'center', marginLeft: 8 }}
    >
      <LightgridLogo style={{ height: 22, marginTop: 3 }} />
    </Link>
  )
}
