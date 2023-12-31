export function LightgridLogo(attrs: React.SVGAttributes<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 811 168" {...attrs}>
      <g fill="none" fill-rule="evenodd">
        <text
          fill="var(--textColor)"
          fontFamily="Helvetica"
          fontSize="140"
          letterSpacing="10"
        >
          <tspan x="203" y="136">
            Lightgrid
          </tspan>
        </text>
        <rect width="146" height="146" y="11" fill="#101010" rx="8" />
        <path
          fill="var(--brandColor)"
          d="M0 11h67c-.167 16-3.833 30.667-11 44-7.167 13.333-17.833 25.333-32 36h43v66H0V11m80 146h66V11H80v66h44c-13.658 8.711-24.324 20.045-32 34-7.676 13.955-11.676 29.289-12 46Z"
        />
      </g>
    </svg>
  )
}
