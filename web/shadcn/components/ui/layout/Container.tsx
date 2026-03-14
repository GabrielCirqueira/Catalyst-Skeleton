import { cn } from "@shadcn/lib/utils";
import * as React from "react";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  // Optional size mapping. If omitted, no max-w-* is applied so
  // you can control width entirely with Tailwind classes on the
  // component usage.
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const SIZE_MAP: Record<NonNullable<ContainerProps["size"]>, string> = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  full: "max-w-full",
};

export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, ...props }, ref) => {
    // Apply the mapped max-width only when `size` is provided. This
    // lets callers control width via Tailwind classes if they prefer.
    const sizeClass = size ? SIZE_MAP[size] : "";

    return <div ref={ref} className={cn("mx-auto px-4 w-full", sizeClass, className)} {...props} />;
  }
);
Container.displayName = "Container";

export default Container;
