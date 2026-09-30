import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: 'Poppins, ui-sans-serif, system-ui, sans-serif' },
        body: { value: 'Lato, ui-sans-serif, system-ui, sans-serif' },
      },
      colors: {
        brand: {
          50: { value: '#f5f3ff' },
          100: { value: '#ede9fe' },
          200: { value: '#ddd6fe' },
          300: { value: '#c4b5fd' },
          400: { value: '#a78bfa' },
          500: { value: '#8b5cf6' },
          600: { value: '#7c3aed' },
          700: { value: '#6d28d9' },
          800: { value: '#5b21b6' },
          900: { value: '#4c1d95' },
          950: { value: '#2e1065' },
        },
      },
    },
    semanticTokens: {
      colors: {
        brand: {
          contrast: { value: 'white' },
          fg: { value: { _light: '{colors.brand.700}', _dark: '{colors.brand.300}' } },
          subtle: { value: { _light: '{colors.brand.100}', _dark: '{colors.brand.900}' } },
          muted: { value: { _light: '{colors.brand.200}', _dark: '{colors.brand.800}' } },
          emphasized: { value: { _light: '{colors.brand.300}', _dark: '{colors.brand.700}' } },
          solid: { value: { _light: '{colors.brand.600}', _dark: '{colors.brand.500}' } },
          focusRing: { value: '{colors.brand.500}' },
        },
      },
    },
  },
})

export const theme = createSystem(defaultConfig, config)
