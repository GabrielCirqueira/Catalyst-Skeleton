import '@fontsource/lato'
import '@fontsource/poppins'
import '@fontsource-variable/roboto'
import '@fontsource-variable/inter'
import { createTheme } from '@mantine/core'

const theme = createTheme({
  fontFamily: 'inter, poppins, roboto, lato, sans-serif',
  colorScheme: 'dark',
  colors: {
    brand: [
      '#e6fbfa',
      '#c8f4f2',
      '#a4e8e6',
      '#7cdad8',
      '#55cdca',
      '#3bc0bd',
      '#2fa5a3',
      '#248b8a',
      '#1a6f70',
      '#105555',
    ],
    dark: [
      '#d6f5f4',
      '#a8dbda',
      '#79c1c1',
      '#4ba8a8',
      '#1d8f90',
      '#107576',
      '#0a5c5e',
      '#054345',
      '#022a2c',
      '#011517',
    ],
  },
  primaryColor: 'brand',
  primaryShade: {
    light: 5,
    dark: 6,
  },
  components: {
    Button: {
      defaultProps: {
        color: 'brand',
        radius: 'xl',
        size: 'md',
      },
    },
  },
})

export default theme
