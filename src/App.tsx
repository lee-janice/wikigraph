import "./styles/App.css";
import WikiGraph from "./components/wikigraph";
import { useEffect, useState } from "react";
import { WikiSummary } from "./components/sidebar/wikipediaSummaries";
import Sidebar from "./components/sidebar";
import NeoVis from "neovis.js";
import { VisNetwork, visLoader, Vis } from "./api/vis/vis";
import { VisContext } from "./context/visContext";

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

    useEffect(() => {
        const onReady = (vis: NeoVis, e: any) => {
            if (!vis.network) {
                return;
            }
            setVis(new Vis(vis));
            setVisNetwork(new VisNetwork(vis.network));
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

    return (
        <div className="dark">
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
                        darkMode={darkMode}
                    />
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
