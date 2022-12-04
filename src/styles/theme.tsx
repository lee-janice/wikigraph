import styled, { css, createGlobalStyle } from 'styled-components'

export { css, styled }

export const theme = {
  colors: {
    black: '#000000',
    background: '#fffff8',
    contrast: '#111',
    contrastLightest: '#dad9d9',
    accent: 'red',
    white: '#ffffff',
  },
}

const defaults = (): string => `
::selection {
  background-color: ${theme.colors.contrastLightest};
  color: rgba(0, 0, 0, 0.70);
}
`
export const GlobalStyle = createGlobalStyle`
${defaults()}
`