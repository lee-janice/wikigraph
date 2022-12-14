import React from "react";
import * as theme from "../styles/theme";

interface Props {
    readonly title?: string;
    readonly children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => (
    <>
        <theme.GlobalStyle />
        <main className="content" role="main">
            {children}
        </main>
        {/* <StyleToggles /> */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
    </>
);

export default Layout;
