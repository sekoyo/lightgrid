import { createContext } from "solid-js";

type Theme = "light" | "dark";

export const ThemeContext = createContext<Theme>("dark");
