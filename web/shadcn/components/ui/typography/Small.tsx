import * as React from "react";
import { cn } from "@shadcn/lib/utils";

export interface SmallProps extends React.HTMLAttributes<HTMLElement> {}

export const Small = React.forwardRef<HTMLElement, SmallProps>(({ className, ...props }, ref) => {
  const Tag: any = "small";
  return <Tag ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />;
});

Small.displayName = "Small";

export default Small;
