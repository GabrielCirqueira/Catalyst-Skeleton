import { cn } from '@/shared/lib/cn'
import type { ComponentProps } from 'react'

export const Flex = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('flex gap-2', className)} {...props} />
)

export const HStack = ({ className, ...props }: ComponentProps<'div'>) => (
  <Flex className={cn('flex-row items-center', className)} {...props} />
)

export const VStack = ({ className, ...props }: ComponentProps<'div'>) => (
  <Flex className={cn('flex-col', className)} {...props} />
)

export const Box = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn(className)} {...props} />
)

export const Grid = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('grid gap-4', className)} {...props} />
)

const containerSizes = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
} as const

type ContainerSize = keyof typeof containerSizes

interface ContainerProps extends ComponentProps<'div'> {
  size?: ContainerSize
}

export const Container = ({ size = 'xl', className, ...props }: ContainerProps) => (
  <div className={cn('mx-auto w-full px-4', containerSizes[size], className)} {...props} />
)


type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'strong' | 'em' | 'small'

interface TextProps extends ComponentProps<'p'> {
  as?: TextElement
}

export const Text = ({ as: Tag = 'p', className, ...props }: TextProps) => (
  // biome-ignore lint/suspicious/noExplicitAny: polimorfismo via prop `as`
  <Tag className={cn(className)} {...(props as any)} />
)
