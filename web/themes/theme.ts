import '@fontsource/lato'
import '@fontsource/poppins'
import '@fontsource-variable/roboto'
import '@fontsource-variable/inter'
import { createTheme } from '@mantine/core'

const theme = createTheme({
  fontFamily: 'inter, poppins, roboto, lato, sans-serif',
  colors: {
    brand: [
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
    ],
  },
  primaryColor: 'brand',
  primaryShade: {
    light: 5,
    dark: 7,
  },
})

export default theme
