import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface FlexProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "row" | "col" | "row-reverse" | "col-reverse";
  gap?: string;
  align?: string;
  justify?: string;
}

export const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction = "row", gap = "", align = "", justify = "", ...props }, ref) => {
    const dirClass =
      direction === "row"
        ? "flex-row"
        : direction === "col"
          ? "flex-col"
          : direction === "row-reverse"
            ? "flex-row-reverse"
            : "flex-col-reverse";
    return (
      <div ref={ref} className={cn("flex", dirClass, gap, align, justify, className)} {...props} />
    );
  }
);
Flex.displayName = "Flex";

export default Flex;
