import NavBar, { NavTab } from "./sidebar/navbar";
import UserManual from "./sidebar/userManual";
import About from "./sidebar/about";
import WikipediaSummaries, { WikiSummary } from "./sidebar/wikipediaSummaries";
import styled from "styled-components";
import { Dispatch, SetStateAction, useState } from "react";
import { Vis, VisNetwork } from "../api/vis/vis";

/* https://www.w3schools.com/howto/howto_css_fixed_sidebar.asp */
const StyledSidebar = styled.div`
    height: 100%;
    width: 33%;
    padding-top: 20px;
    top: 0;
    right: 0;
    position: fixed; /* stay in place on scroll */
    z-index: 100;
    overflow-x: hidden; /* disable horizontal scroll */
    border-left: 1px solid var(--borderColor);
    background-color: var(--primaryBackgroundColor);

    @media (max-width: 1100px) {
        height: 100%;
        width: 100%;
        top: 80%;
        display: block;
        position: absolute;
        z-index: 10000;
        border-left: none;
        border-top: 1px solid var(--borderColor);
    }
`;

interface Props {
    vis: Vis | null;
    visNetwork: VisNetwork | null;
    input: string;
    setInput: Dispatch<SetStateAction<string>>;
    summaries: WikiSummary[];
    setSummaries: Dispatch<SetStateAction<WikiSummary[]>>;
    currentSummary: WikiSummary | null;
    setCurrentSummary: Dispatch<SetStateAction<WikiSummary | null>>;
}

const Sidebar: React.FC<Props> = ({
    vis,
    visNetwork,
    input,
    setInput,
    summaries,
    setSummaries,
    currentSummary,
    setCurrentSummary,
}) => {
    // keep track of nav bar tab state
    const [currentNavTab, setCurrentNavTab] = useState<NavTab>(NavTab.Home);

    if (!vis || !visNetwork) {
        return <StyledSidebar className="sidebar"></StyledSidebar>;
    }

    // ----- execute cypher query when user inputs search, update visualization -----
    const createNewGraph = () => {
        // TODO: replace this with something that does not open the DB up to an injection attack
        var cypher =
            'CALL { MATCH (p:Page) WHERE apoc.text.levenshteinSimilarity(p.title, "' +
            input +
            '") > 0.65 RETURN p.title as title ORDER BY apoc.text.levenshteinSimilarity(p.title, "' +
            input +
            '") DESC LIMIT 1 } MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE p1.title = title RETURN p1, l, p2';
        // TODO: only render if the query returns > 0 nodes, otherwise tell user no nodes were found
        vis.renderWithCypher(cypher);
        visNetwork.moveTo({ position: { x: 0, y: 0 } });
    };

    const addToGraph = () => {
        var cypher =
            'CALL { MATCH (p:Page) WHERE apoc.text.levenshteinSimilarity(p.title, "' +
            input +
            '") > 0.65 RETURN p.title as title ORDER BY apoc.text.levenshteinSimilarity(p.title, "' +
            input +
            '") DESC LIMIT 1 } MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE p1.title = title RETURN p1, l, p2';
        vis.updateWithCypher(cypher);
        visNetwork.moveTo({ position: { x: 0, y: 0 } });
    };

    return (
        <StyledSidebar className="sidebar">
            <NavBar currentNavTab={currentNavTab} setCurrentNavTab={setCurrentNavTab} />
            {currentNavTab === NavTab.Home && (
                <>
                    <WikipediaSummaries
                        summaries={summaries}
                        setSummaries={setSummaries}
                        currentSummary={currentSummary}
                        setCurrentSummary={setCurrentSummary}
                    />
                    <div className="search-bar">
                        Search for a Wikipedia article:
                        <br />
                        <input type="search" placeholder="Article title" onChange={(e) => setInput(e.target.value)} />
                        <br />
                        <input type="submit" value="Create new graph" onClick={createNewGraph} />
                        <input type="submit" value="Add to graph" onClick={addToGraph} />
                    </div>
                </>
            )}
            {currentNavTab === NavTab.About && <About />}
            {currentNavTab === NavTab.UserManual && <UserManual />}
        </StyledSidebar>
    );
};

export default Sidebar;
