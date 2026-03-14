import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface SubtitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h2" | "h3" | "h4";
}

export const Subtitle = React.forwardRef<HTMLElement, SubtitleProps>(
  ({ as = "h2", className, ...props }, ref) => {
    const Tag = as as any;
    return (
      <Tag
        ref={ref as any}
        className={cn("text-2xl font-medium text-muted-foreground", className)}
        {...props}
      />
    );
  }
);

Subtitle.displayName = "Subtitle";

export default Subtitle;
