import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface VStackProps extends React.HTMLAttributes<HTMLDivElement> {
  gap?: string; // Tailwind gap class (e.g. 'gap-2')
  align?: string; // Tailwind alignment (e.g. 'items-center')
  justify?: string; // Tailwind justify (e.g. 'justify-center')
}

export const VStack = React.forwardRef<HTMLDivElement, VStackProps>(
  ({ className, gap = "gap-2", align = "items-start", justify = "", ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col", gap, align, justify, className)} {...props} />
    );
  }
);
VStack.displayName = "VStack";

export default VStack;
