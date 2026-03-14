import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface CaptionProps extends React.HTMLAttributes<HTMLElement> {}

export const Caption = React.forwardRef<HTMLElement, CaptionProps>(
  ({ className, ...props }, ref) => {
    const Tag: any = "span";
    return <Tag ref={ref} className={cn("text-xs text-muted-foreground", className)} {...props} />;
  }
);

Caption.displayName = "Caption";

export default Caption;
