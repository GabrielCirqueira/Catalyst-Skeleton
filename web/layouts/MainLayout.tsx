import { Box } from "@shadcn/layout";
import { cn } from "@shadcn/lib/utils";
import * as React from "react";
import { Outlet } from "react-router-dom";

export interface MainLayoutProps {
  className?: string;
}

export const MainLayout = React.forwardRef<HTMLDivElement, MainLayoutProps>(
  ({ className }, ref) => {
    return (
      <Box ref={ref} className={cn("min-h-screen", "flex flex-col", "antialiased", className)}>
        <Box as="main" className="flex-1 flex flex-col">
          <Outlet />
        </Box>
      </Box>
    );
  }
);

MainLayout.displayName = "MainLayout";
