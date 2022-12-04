import React from 'react'
import * as theme from '../styles/theme'
// import StyleToggles from './theme/styleToggles'

const StyledFooter = theme.styled.footer`
  padding-bottom: 36px;
`

interface Props {
  readonly title?: string
  readonly children: React.ReactNode
}

const Layout: React.FC<Props> = ({ children }) => (
  <>
    <theme.GlobalStyle />
    <main className="content" role="main">
      {children}
    </main>
    {/* <StyledFooter className="footer">
      © {new Date().getFullYear()},{` `}
      <a href="https://lee-janice.github.io">a cozy space</a>. Built with
      {` `}
      <a href="https://www.gatsbyjs.org">Gatsby</a>.
    </StyledFooter> */}
    {/* <StyleToggles /> */}
    <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
  </>
)

export default Layout