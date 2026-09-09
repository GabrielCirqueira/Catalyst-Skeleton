import { cn } from '@/shared/lib/cn'
import * as React from 'react'

export interface AppContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  maxWidth?: 'full' | '7xl' | '6xl' | '5xl' | '4xl' | '3xl' | '2xl' | 'xl' | 'lg'
  paddingY?: '0' | '4' | '6' | '8' | '12' | '16'
  paddingX?: '0' | '4' | '6' | '8' | '12'
  centered?: boolean
}

const maxWidthMap = {
  full: 'max-w-full',
  '7xl': 'max-w-7xl',
  '6xl': 'max-w-6xl',
  '5xl': 'max-w-5xl',
  '4xl': 'max-w-4xl',
  '3xl': 'max-w-3xl',
  '2xl': 'max-w-2xl',
  xl: 'max-w-xl',
  lg: 'max-w-lg',
}

const paddingYMap = {
  '0': 'py-0',
  '4': 'py-4',
  '6': 'py-6',
  '8': 'py-8',
  '12': 'py-12',
  '16': 'py-16',
}
const paddingXMap = { '0': 'px-0', '4': 'px-4', '6': 'px-6', '8': 'px-8', '12': 'px-12' }

export const AppContainer = React.forwardRef<HTMLDivElement, AppContainerProps>(
  (
    {
      children,
      className,
      maxWidth = 'full',
      paddingY = '8',
      paddingX = '6',
      centered = true,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        'w-full',
        maxWidthMap[maxWidth],
        paddingYMap[paddingY],
        paddingXMap[paddingX],
        centered && 'mx-auto',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

AppContainer.displayName = 'AppContainer'
