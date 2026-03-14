import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface LeadProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export const Lead = React.forwardRef<HTMLParagraphElement, LeadProps>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("text-lg text-muted-foreground", className)} {...props} />;
  }
);

Lead.displayName = "Lead";

export default Lead;
