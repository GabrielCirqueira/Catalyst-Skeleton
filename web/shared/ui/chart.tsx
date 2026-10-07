import { Box, Flex, Grid, HStack, Text } from '@chakra-ui/react'
import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

interface ChartContextProps {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart deve ser usado dentro de <ChartContainer />')
  }

  return context
}

export const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    config: ChartConfig
    children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children']
  }
>(({ id, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <Box
        data-chart={chartId}
        ref={ref}
        display="flex"
        aspectRatio="16/9"
        justifyContent="center"
        fontSize="xs"
        css={{
          '& .recharts-layer, & .recharts-sector, & .recharts-surface': { outline: 'none' },
        }}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </Box>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = 'ChartContainer'

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, cfg]) => cfg.theme || cfg.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`
          )
          .join('\n'),
      }}
    />
  )
}

export const ChartTooltip = RechartsPrimitive.Tooltip

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      indicator?: 'line' | 'dot' | 'dashed'
      nameKey?: string
      labelKey?: string
    }
>(
  (
    {
      active,
      payload,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter) {
        return <Text fontWeight="medium">{labelFormatter(value, payload)}</Text>
      }

      if (!value) {
        return null
      }

      return <Text fontWeight="medium">{value}</Text>
    }, [label, labelFormatter, payload, hideLabel, config, labelKey])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== 'dot'

    return (
      <Grid
        ref={ref}
        minW="32"
        alignItems="start"
        gap="1.5"
        rounded="lg"
        borderWidth="1px"
        bg="catalist.grey.0"
        px="2.5"
        py="1.5"
        fontSize="xs"
        boxShadow="xl"
      >
        {!nestLabel ? tooltipLabel : null}
        <Grid gap="1.5">
          {payload
            .filter((item) => item.type !== 'none')
            .map((item, index) => {
              const key = `${nameKey || item.name || item.dataKey || 'value'}`
              const itemConfig = getPayloadConfigFromPayload(config, item, key)
              const indicatorColor = color || item.payload.fill || item.color

              return (
                <Flex
                  key={String(item.dataKey)}
                  w="full"
                  wrap="wrap"
                  align={indicator === 'dot' ? 'center' : 'stretch'}
                  gap="2"
                >
                  {formatter && item?.value !== undefined && item.name ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <>
                      {itemConfig?.icon ? (
                        <itemConfig.icon />
                      ) : (
                        !hideIndicator && (
                          <Box
                            flexShrink="0"
                            rounded="2px"
                            w={indicator === 'dot' ? '2.5' : indicator === 'line' ? '1' : '0'}
                            h={indicator === 'dot' ? '2.5' : undefined}
                            borderWidth={indicator === 'dashed' ? '1.5px' : undefined}
                            borderStyle={indicator === 'dashed' ? 'dashed' : undefined}
                            bg={indicator === 'dashed' ? 'transparent' : indicatorColor}
                            borderColor={indicatorColor}
                            my={nestLabel && indicator === 'dashed' ? '0.5' : undefined}
                          />
                        )
                      )}
                      <Flex
                        flex="1"
                        justify="space-between"
                        align={nestLabel ? 'end' : 'center'}
                        lineHeight="1"
                      >
                        <Grid gap="1.5">
                          {nestLabel ? tooltipLabel : null}
                          <Text color="catalist.grey.600">{itemConfig?.label || item.name}</Text>
                        </Grid>
                        {item.value && (
                          <Text fontFamily="mono" fontWeight="medium">
                            {item.value.toLocaleString()}
                          </Text>
                        )}
                      </Flex>
                    </>
                  )}
                </Flex>
              )
            })}
        </Grid>
      </Grid>
    )
  }
)
ChartTooltipContent.displayName = 'ChartTooltipContent'

export const ChartLegend = RechartsPrimitive.Legend

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
      hideIcon?: boolean
      nameKey?: string
    }
>(({ hideIcon = false, payload, verticalAlign = 'bottom', nameKey }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <HStack
      ref={ref}
      justify="center"
      gap="4"
      pt={verticalAlign === 'top' ? undefined : '3'}
      pb={verticalAlign === 'top' ? '3' : undefined}
    >
      {payload
        .filter((item) => item.type !== 'none')
        .map((item) => {
          const key = `${nameKey || item.dataKey || 'value'}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)

          return (
            <HStack key={String(item.value)} gap="1.5">
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <Box boxSize="2" flexShrink="0" rounded="2px" bg={item.color} />
              )}
              {itemConfig?.label}
            </HStack>
          )
        })}
    </HStack>
  )
})
ChartLegendContent.displayName = 'ChartLegendContent'

function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config]
}
