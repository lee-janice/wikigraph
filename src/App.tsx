import "./styles/App.css";
import WikiGraph from "./components/wikigraph";
import { useEffect, useState } from "react";
import { WikiSummary } from "./components/sidebar/wikipediaSummaries";
import Sidebar from "./components/sidebar";
import NeoVis from 'neovis.js';
import { VisNetwork, visLoader } from "./api/vis/vis";
import { VisContext } from "./context/visContext";

function App() {
    // keep vis object in state
    const [vis, setVis] = useState<NeoVis | null>(null);
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
			const visNetwork = new VisNetwork(vis.network);
			setVis(vis);
			setVisNetwork(visNetwork);
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

    if (!vis || !visNetwork) {
		return <h1>Loading...</h1>;
	}
     
    return (
        <VisContext.Provider value={{vis, visNetwork}}>
            <header>
                <h1>
                    <strong>WikiGraph</strong>
                </h1>
                <p className="subtitle">A graph-based approach to exploring the depths of Wikipedia</p>
            </header>
            <div className="App">
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
        </VisContext.Provider>
    );
}

export default App;
