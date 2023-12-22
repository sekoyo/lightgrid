import type { JSX } from "solid-js";

export function LightgridLogo(attrs: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 811 157" {...attrs}>
      <g fill="none" fill-rule="evenodd">
        <text
          font-family="Helvetica"
          font-size="140"
          letter-spacing="10"
          fill="var(--textColor)"
        >
          <tspan x="203" y="125">
            Lightgrid
          </tspan>
        </text>
        <path fill="none" d="M0 0h146v146H0z" />
        <path
          d="M0 0h67c-.167 16-3.833 30.667-11 44-7.167 13.333-17.833 25.333-32 36h43v66H0V0m80 146h66V0H80v66h44c-13.658 8.711-24.324 20.045-32 34-7.676 13.955-11.676 29.289-12 46Z"
          fill="var(--brandColor)"
        />
      </g>
    </svg>
  );
}
