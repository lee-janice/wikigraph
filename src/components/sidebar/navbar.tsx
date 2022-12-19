import React, { Dispatch, SetStateAction } from "react";
import { styled } from "../../styles/theme";

// style navigation bar using styled-components
const StyledNav = styled.nav`
    padding-top: 0px;

    @media screen and (max-width: 1100px) {
        display: none;
    }

    ul {
        list-style-type: none;
        margin: 0;
        padding: 0;
    }

    li {
        display: inline-block;
        margin-left: 24px;
        margin-right: 24px;
        font-variant: small-caps;
        cursor: pointer;

        a {
            background: none;
        }
    }
`;

export enum NavTab {
    Home,
    About,
    UserManual,
}

interface Props {
    currentNavTab: NavTab;
    setCurrentNavTab: Dispatch<SetStateAction<NavTab>>;
}

const NavBar: React.FC<Props> = ({ currentNavTab, setCurrentNavTab }) => {
    return (
        <div>
            <StyledNav className="navigation">
                <ul>
                    {currentNavTab === NavTab.Home ? (
                        <li onClick={() => setCurrentNavTab(NavTab.Home)}>
                            <u>Home</u>
                        </li>
                    ) : (
                        <li onClick={() => setCurrentNavTab(NavTab.Home)}>Home</li>
                    )}
                    {currentNavTab === NavTab.About ? (
                        <li onClick={() => setCurrentNavTab(NavTab.About)}>
                            <u>About</u>
                        </li>
                    ) : (
                        <li onClick={() => setCurrentNavTab(NavTab.About)}>About</li>
                    )}
                    {currentNavTab === NavTab.UserManual ? (
                        <li onClick={() => setCurrentNavTab(NavTab.UserManual)}>
                            <u>User Manual</u>
                        </li>
                    ) : (
                        <li onClick={() => setCurrentNavTab(NavTab.UserManual)}>User Manual</li>
                    )}
                </ul>
            </StyledNav>
        </div>
    );
};

export default NavBar;
