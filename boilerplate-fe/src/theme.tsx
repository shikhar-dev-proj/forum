import { theme as chakraTheme } from '@chakra-ui/core'

const fonts = { ...chakraTheme.fonts, mono: `'Menlo', monospace` }

const breakpoints = ['40em', '52em', '64em']

const theme = {
  ...chakraTheme,
  colors: {
    ...chakraTheme.colors,
    black: '#111111',
    primary: {
      50: '#e1f7ff',
      100: '#bce3f4',
      200: '#95cfea',
      300: '#6dbce0',
      400: '#47a8d7',
      500: '#308fbe',
      600: '#236f94',
      700: '#154f6a',
      800: '#063042',
      900: '#00111a',
    },
    error: {
      50: '#ffe7e7',
      100: '#f2c2c2',
      200: '#e39c9c',
      300: '#d67576',
      400: '#c94f4f',
      500: '#b03636',
      600: '#8a2929',
      700: '#631c1d',
      800: '#3e0f10',
      900: '#1d0202',
    }

  },
  fonts,
  breakpoints,
  icons: {
    ...chakraTheme.icons
  },
}

export default theme
