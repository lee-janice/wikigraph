import "./styles/App.css";
import WikiGraph from "./components/wikigraph";
import { useEffect, useState } from "react";
import { WikiSummary } from "./components/sidebar/wikipediaSummaries";
import Sidebar from "./components/sidebar";
import NeoVis from "neovis.js";

const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

function App() {
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

    // keep vis object in state
    const [vis, setVis] = useState<NeoVis | null>(null);

    // keep track of summaries
    // TODO: combine into one object
    const [summaries, setSummaries] = useState<WikiSummary[]>([]);
    const [currentSummary, setCurrentSummary] = useState<WikiSummary | null>(null);

    // keep track of search bar input
    const [input, setInput] = useState("");

    return (
        <>
            <header>
                <h1>
                    <strong>WikiGraph</strong>
                </h1>
                <p className="subtitle">A graph-based approach to exploring the depths of Wikipedia</p>
            </header>
            <div className="App">
                {/* graph visualization */}
                <WikiGraph
                    vis={vis}
                    setVis={setVis}
                    containerId={"vis"}
                    serverDatabase={NEO4J_DB}
                    serverURI={NEO4J_URI}
                    serverUser={NEO4J_USER}
                    serverPassword={NEO4J_PASSWORD}
                    summaries={summaries}
                    setSummaries={setSummaries}
                    setCurrentSummary={setCurrentSummary}
                    darkMode={darkMode}
                />
                {/* sidebar */}
                <Sidebar
                    vis={vis}
                    input={input}
                    setInput={setInput}
                    summaries={summaries}
                    setSummaries={setSummaries}
                    currentSummary={currentSummary}
                    setCurrentSummary={setCurrentSummary}
                />
                {/* light/dark mode toggle */}
                <label id="theme-toggle">
                    <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} /> Dark mode
                </label>
            </div>
        </>
    );
}

export default App;
