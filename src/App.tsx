import "./styles/App.css";
import WikiGraph from "./components/wikigraph";
import { useEffect, useState } from "react";
import { WikiSummary } from "./components/sidebar/wikipediaSummaries";
import Sidebar from "./components/sidebar";
import { VisNetwork, Vis, visLoader } from "./api/vis/vis";
import { VisContext } from "./context/visContext";
import NeoVis, { NeoVisEvents } from "neovis.js";
import Alert, { AlertState, AlertType } from "./components/alert";
import styled from "styled-components";
import ExpandButton from "./components/buttons/expand";
import CenterButton from "./components/buttons/center";
import StabilizeButton from "./components/buttons/stabilize";

const StyledVisContainer = styled.div`
    height: ${(props) => (props.theme.expanded ? "100%;" : "80%;")}
    width: ${(props) => (props.theme.expanded ? "100%;" : "60%;")}
    top: ${(props) => (props.theme.expanded ? "0px;" : "inherit;")}
    left: ${(props) => (props.theme.expanded ? "0px;" : "inherit;")}
    z-index: ${(props) => (props.theme.expanded ? "10000;" : "0;")}
    position: fixed;

    @media (max-width: 1100px) {
        height: ${(props) => (props.theme.expanded ? "100%;" : "55%;")}
        width: ${(props) => (props.theme.expanded ? "100%;" : "90%;")}
    }
`;

StyledVisContainer.defaultProps = {
    theme: {
        expanded: false,
    },
};

function App() {
    // keep vis object in state
    const [vis, setVis] = useState<Vis | null>(null);
    const [visNetwork, setVisNetwork] = useState<VisNetwork | null>(null);

    // set initial theme and keep track of dark mode state
    const [darkMode, setDarkMode] = useState(window.matchMedia("(prefers-color-scheme: dark)").matches);
    // handle change in dark mode toggle
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add("dark");
            document.body.classList.remove("light");
        } else {
            document.body.classList.add("light");
            document.body.classList.remove("dark");
        }
    }, [darkMode]);

    // keep track of whether the vis is expanded
    const [visIsExpanded, setVisIsExpanded] = useState(false);

    // load Vis and VisNetwork objects
    useEffect(() => {
        const onReady = (vis: NeoVis, e: any) => {
            if (!vis.network) {
                return;
            }
            setVis(new Vis(vis));
            setVisNetwork(new VisNetwork(vis.network));
            // register record count event
            vis.registerOnEvent(NeoVisEvents.CompletionEvent, (e) => {
                setRecordCount(e.recordCount);
            });
        };
        visLoader.load(onReady);
        return () => {
            setVis(null);
            setVisNetwork(null);
        };
    }, []);

    // keep track of summaries
    // TODO: combine into one object
    const [summaries, setSummaries] = useState<WikiSummary[]>([]);
    const [currentSummary, setCurrentSummary] = useState<WikiSummary | null>(null);

    // keep track of search bar input
    const [input, setInput] = useState("");

    // keep track of record count status
    const [recordCount, setRecordCount] = useState(-1);

    // keep track of alert status
    const [alertState, setAlertState] = useState<AlertState>({
        show: false,
        type: AlertType.None,
    });

    // ----- alert user if something went wrong -----
    useEffect(() => {
        // recordCount = number of nodes returned in the query
        if (recordCount === 0) {
            // if there's 0 nodes, there was no such page found (happens when user searches for page that does not exist)
            setAlertState({ show: true, type: AlertType.NoArticleFound });
        } else if (recordCount === 1) {
            // if there's only 1 node, then user tried to expand a node that has no other links
            setAlertState({ show: true, type: AlertType.EndOfPath });
        }
        setRecordCount(-1);
    }, [recordCount]);

    return (
        <div>
            <header>
                <h1>
                    <strong>WikiGraph</strong>
                </h1>
                <p className="subtitle">A graph-based approach to exploring the depths of Wikipedia</p>
            </header>
            <div className="App">
                <VisContext.Provider value={{ vis, visNetwork }}>
                    <StyledVisContainer theme={{ expanded: visIsExpanded }}>
                        {/* graph visualization */}
                        <WikiGraph
                            containerId={"vis"}
                            summaries={summaries}
                            setSummaries={setSummaries}
                            setCurrentSummary={setCurrentSummary}
                            setAlertState={setAlertState}
                            darkMode={darkMode}
                        />
                        {/* buttons */}
                        <ExpandButton
                            visIsExpanded={visIsExpanded}
                            setVisIsExpanded={setVisIsExpanded}
                            darkMode={darkMode}
                        />
                        <StabilizeButton vis={vis} />
                        <CenterButton visNetwork={visNetwork} />
                        {/* alert */}
                        <Alert state={alertState}></Alert>
                    </StyledVisContainer>
                    {/* sidebar */}
                    <Sidebar
                        input={input}
                        setInput={setInput}
                        summaries={summaries}
                        setSummaries={setSummaries}
                        currentSummary={currentSummary}
                        setCurrentSummary={setCurrentSummary}
                    />
                </VisContext.Provider>
                {/* light/dark mode toggle */}
                <label id="theme-toggle">
                    <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark mode
                </label>
            </div>
        </div>
    );
}

export default App;
