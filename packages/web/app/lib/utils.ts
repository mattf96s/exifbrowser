import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

//
/** Conditionally add Tailwind classes; https://ui.shadcn.com/docs/installation#manual-installation */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
