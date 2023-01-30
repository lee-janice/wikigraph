import "./styles/App.css";
import WikiGraph from "./components/wikigraph";
import { useEffect, useState } from "react";
import { WikiSummary } from "./components/sidebar/wikipediaSummaries";
import Sidebar from "./components/sidebar";
import { VisNetwork, Vis, visLoader } from "./api/vis/vis";
import { VisContext } from "./context/visContext";
import NeoVis from "neovis.js";
import Alert, { AlertState, AlertType } from "./components/alert";

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

    // const currentNodesRef = useRef<VN.DataSet<Node>>(null);

    useEffect(() => {
        const onReady = (vis: NeoVis, e: any) => {
            if (!vis.network) {
                return;
            }
            setVis(new Vis(vis));
            setVisNetwork(new VisNetwork(vis.network));
            // currentNodesRef.current = vis.nodes;
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

    // useEffect(() => {
    // when vis renders, check if new nodes are added
    // if not, then some action the user took did not result in a change
    // vis?.registerOnEvent(NeoVisEvents.CompletionEvent, (e) => {
    //     console.log(currentNodesRef.current);
    //     console.log(vis.nodes());
    //     if (currentNodesRef.current.length === vis.nodes()) {
    //         console.log("that's the same");
    //     }
    //     currentNodesRef.current = vis.nodes();
    // });
    // }, []);

    // Move the alert logic to the APP.tsx since it's part of the global state,
    // wire e.recordCount from there
    // setRecordCount(e.recordCount);
    // // close alert if new graph is rendered and record count is > 1
    // if (e.recordCount > 1) {
    //     setAlertState({
    //         show: false,
    //         type: AlertType.None,
    //     });
    // }

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
                    {/* graph visualization */}
                    <WikiGraph
                        containerId={"vis"}
                        summaries={summaries}
                        setSummaries={setSummaries}
                        setCurrentSummary={setCurrentSummary}
                        setAlertState={setAlertState}
                        darkMode={darkMode}
                    />
                    {/* alert */}
                    <Alert state={alertState}></Alert>
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
