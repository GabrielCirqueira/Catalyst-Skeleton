import * as React from "react";

export interface SpacerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: string; // tailwind width/height classes like 'w-4' or 'h-4'
}

export const Spacer = React.forwardRef<HTMLDivElement, SpacerProps>(
  ({ size = "flex-1", style, ...props }, ref) => {
    const mergedStyle = { ...(style || {}), display: "block" };
    return <div ref={ref} style={mergedStyle} className={size} {...props} />;
  }
);

Spacer.displayName = "Spacer";

export default Spacer;
