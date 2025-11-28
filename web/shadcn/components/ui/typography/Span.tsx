import { cn } from "@shadcn/lib/utils";
import * as React from "react";

export interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {
  as?: "span";
}

export const Span = React.forwardRef<HTMLSpanElement, SpanProps>(({ className, ...props }, ref) => {
  return <span ref={ref} className={cn(className)} {...props} />;
});

Span.displayName = "Span";

export default Span;
