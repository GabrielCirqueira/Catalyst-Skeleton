import '@fontsource/lato'
import { createTheme } from '@mantine/core'

const brand: [string, string, string, string, string, string, string, string, string, string] = [
  '#e0faf9',
  '#b8f2ed',
  '#7fe2dc',
  '#33d4c6',
  '#00bfa5',
  '#00a389',
  '#008f74',
  '#00755c',
  '#005a47',
  '#00443a',
]

const theme = createTheme({
  fontFamily: 'Lato, sans-serif',
  colors: {
    brand,
  },
  primaryColor: 'brand',
  primaryShade: { light: 5, dark: 7 },
})

export default theme
