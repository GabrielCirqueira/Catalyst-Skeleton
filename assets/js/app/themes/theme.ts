import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

// Configuração inicial do tema (dark/light mode)
const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  colors: {
    brand: {
      50: '#E6F6F7',
      100: '#B3E1E4',
      200: '#80CCCC',
      300: '#4DB7B3',
      400: '#26A3A0',
      500: '#1F8C89',
      600: '#186F6E',
      700: '#125355',
      800: '#0B393B',
      900: '#041F20',
    },
    dark: {
      50: '#f0f0f0',
      100: '#d9d9d9',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#262626',
      900: '#0d0d0d',
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'whiteAlpha.900' : 'gray.800',
        transition: 'background-color 0.2s, color 0.2s',
        transitionProperty: 'background-color, color',
        transitionDuration: '1.3s, 1.2s',
      },
      '.chakra-button, .chakra-card, .chakra-input, .chakra-select': {
        transition: 'all 0.3s ease !important',
      },
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
      },
      '::-webkit-scrollbar-thumb': {
        bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.400',
        borderRadius: 'full',
      },
    }),
    
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'xl',
      },
      defaultProps: {
        colorScheme: 'brand',
      },
      variants: {
        solid: (props: any) => ({
          bg: props.colorMode === 'dark' ? 'brand.300' : 'brand.500',
          color: props.colorMode === 'dark' ? 'gray.900' : 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.200' : 'brand.600',
            transform: 'translateY(-2px)',
            boxShadow: 'md',
          },
          _active: {
            bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.700',
          },
        }),
        outline: (props: any) => ({
          borderColor: props.colorMode === 'dark' ? 'brand.300' : 'brand.500',
          color: props.colorMode === 'dark' ? 'brand.300' : 'brand.500',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.900' : 'brand.50',
            borderColor: props.colorMode === 'dark' ? 'brand.200' : 'brand.600',
          },
        }),
      },
    },
    Input: {
      variants: {
        outline: (props: any) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
            _focus: {
              borderColor: 'brand.400',
              boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
            },
            _placeholder: {
              color: props.colorMode === 'dark' ? 'whiteAlpha.500' : 'gray.500',
            },
          },
        }),
      },
    },
    Card: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
          boxShadow: 'sm',
          _hover: {
            boxShadow: 'md',
          },
        },
      }),
    },
    Divider: {
      baseStyle: (props: any) => ({
        borderColor: props.colorMode === 'dark' ? 'gray.700' : 'gray.200',
      }),
    },
  },
  semanticTokens: {
    colors: {
      'chakra-body-text': {
        _light: 'gray.800',
        _dark: 'whiteAlpha.900',
      },
      'chakra-body-bg': {
        _light: 'gray.50',
        _dark: 'gray.900',
      },
      'chakra-border-color': {
        _light: 'gray.200',
        _dark: 'gray.700',
      },
    },
  },
});

export default theme;