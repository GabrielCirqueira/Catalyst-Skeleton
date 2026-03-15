import * as React from 'react'
import { HStack } from './HStack'

export const Row = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof HStack>>(
  (props, ref) => <HStack ref={ref as any} {...props} />
)

Row.displayName = 'Row'

export default Row
