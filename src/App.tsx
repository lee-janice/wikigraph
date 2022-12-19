import "./styles/App.css";
import WikiGraph from "./components/wikigraph";
import Layout from "./components/layout";
import { useRef } from "react";

const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

function App() {
    // keep track of wikigraph reference
    const visRef = useRef<HTMLDivElement>(null);

    return (
        <Layout>
            <header>
                <h1>
                    <strong>WikiGraph</strong>
                </h1>
                <p className="subtitle">A graph-based approach to exploring the depths of Wikipedia</p>
            </header>
            <div className="App">
                {/* graph visualization */}
                <WikiGraph
                    // pass a reference object and the search state to the wikigraph child component
                    // so we can update the visualization when the search state changes
                    ref={visRef}
                    containerId={"vis"}
                    serverDatabase={NEO4J_DB}
                    serverURI={NEO4J_URI}
                    serverUser={NEO4J_USER}
                    serverPassword={NEO4J_PASSWORD}
                />
            </div>
        </Layout>
    );
}

export default App;
