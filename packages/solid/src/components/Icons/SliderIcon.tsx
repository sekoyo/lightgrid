import { type JSX } from "solid-js";

export function SliderIcon(attrs: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 448 162"
      fill="currentColor"
      {...attrs}
    >
      <path d="M432 65H222.4a80 80 0 0 0-156.8 0H16a16 16 0 1 0 0 32h49.6a79.997 79.997 0 0 0 78.4 64.08A80.001 80.001 0 0 0 222.4 97H432a16.002 16.002 0 0 0 16-16 16.002 16.002 0 0 0-16-16Zm-288 64a47.998 47.998 0 0 1-33.941-81.941A48 48 0 1 1 144 129Z" />
    </svg>
  );
}
