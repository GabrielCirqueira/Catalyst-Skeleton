import * as React from 'react'
import { VStack } from './VStack'

export const Col = React.forwardRef<HTMLDivElement, React.ComponentProps<typeof VStack>>(
  (props, ref) => <VStack ref={ref as any} {...props} />
)

Col.displayName = 'Col'

export default Col
