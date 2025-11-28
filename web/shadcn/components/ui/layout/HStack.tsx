import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface HStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string;
  align?: string;
  justify?: string;
}

export const HStack = React.forwardRef<HTMLDivElement, HStackProps>(
  ({ className, gap = "gap-2", align = "items-center", justify = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-row", gap, align, justify, className)} {...props} />
    );
  }
);
HStack.displayName = "HStack";

export default HStack;
