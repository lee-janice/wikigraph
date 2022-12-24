import { useEffect, useRef, useState } from "react";
import NeoVis, { NeovisConfig, NeoVisEvents } from "neovis.js/dist/neovis.js";
import ContextMenu, { ContextMenuState, ContextMenuType } from "./contextMenu";
import NavBar, { NavTab } from "./sidebar/navbar";
import UserManual from "./sidebar/userManual";
import About from "./sidebar/about";
import WikipediaSummaries, { WikiSummary } from "./sidebar/wikipediaSummaries";
import styled from "styled-components";

const StyledCanvas = styled.div`
    height: ${(props) => (props.theme.expanded ? "100%;" : "80%;")}
    width: ${(props) => (props.theme.expanded ? "100%;" : "60%;")}
    top: ${(props) => (props.theme.expanded ? "0px;" : "inherit;")}
    left: ${(props) => (props.theme.expanded ? "0px;" : "inherit;")}
    z-index: ${(props) => (props.theme.expanded ? "100000;" : "100;")}
    position: fixed;

    @media (max-width: 1100px) {
        height: ${(props) => (props.theme.expanded ? "100%;" : "55%;")}
        width: ${(props) => (props.theme.expanded ? "100%;" : "90%;")}
    }
`;

StyledCanvas.defaultProps = {
    theme: {
        expanded: false,
    },
};

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

// TODO: figure out how to import this from vis.js
export type IdType = string | number;

interface Props {
    containerId: string;
    serverDatabase: string;
    serverURI: string;
    serverUser: string;
    serverPassword: string;
    darkMode: boolean;
}

const WikiGraph: React.FC<Props> = ({
    containerId,
    serverDatabase,
    serverURI,
    serverUser,
    serverPassword,
    darkMode,
}) => {
    // keep vis object in state
    const [vis, setVis] = useState<NeoVis | null>(null);
    const [visIsExpanded, setVisIsExpanded] = useState(false);

    // keep track of selected nodes and labels
    // TODO: combine into one object
    const [selection, setSelection] = useState<IdType[]>([]);
    const [selectionLabels, setSelectionLabels] = useState([""]);

    // keep track of summaries
    // TODO: combine into one object
    const [summaries, setSummaries] = useState<WikiSummary[]>([]);
    const [currentSummary, setCurrentSummary] = useState<WikiSummary | null>(null);

    // keep track of search bar input
    const [input, setInput] = useState("");

    // keep track of nav bar tab state
    const [currentNavTab, setCurrentNavTab] = useState<NavTab>(NavTab.Home);

    // keep track of whether the context menu is open or closed
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
        open: false,
        type: ContextMenuType.Canvas,
        mobile: window.innerWidth < 1100,
        x: 0,
        y: 0,
    });
    window.onresize = () => {
        if (window.innerWidth < 1100) {
            if (!contextMenuState.mobile) {
                setContextMenuState({ ...contextMenuState, mobile: true });
            }
        } else {
            if (contextMenuState.mobile) {
                setContextMenuState({ ...contextMenuState, mobile: false });
            }
        }
    };

    // get reference to selection so that we can use the current value in the vis event listeners
    // otherwise, the value lags behind
    const selectionRef = useRef(selection);

    // ----- initialize visualization and neovis object -----
    // TODO: maybe export to util file?
    useEffect(() => {
        var config: NeovisConfig = {
            containerId: containerId,
            // neo4j database connection settings
            serverDatabase: serverDatabase, // specify which database to read from
            neo4j: {
                serverUrl: serverURI,
                serverUser: serverUser,
                serverPassword: serverPassword,
                driverConfig: {
                    // enforce encryption
                    // https://stackoverflow.com/questions/71719427/how-to-visualize-remote-neo4j-auradb-with-neovis-js
                    encrypted: "ENCRYPTION_ON",
                    trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
                },
            },
            // override the default vis.js settings
            // https://visjs.github.io/vis-network/docs/network/#options
            visConfig: {
                nodes: {
                    shape: "circle",
                    color: {
                        background: "lightgray",
                        border: "gray",
                        highlight: {
                            background: "lightgray",
                            border: "gray",
                        },
                    },
                },
                edges: { arrows: { to: { enabled: true } } },
                physics: {
                    // uses the Barnes-Hut algorithm to compute node positions
                    barnesHut: {
                        avoidOverlap: 1, // value between 0 and 1, 1 is maximum overlap avoidance
                        gravitationalConstant: -20000,
                        damping: 0.5,
                    },
                    stabilization: {
                        iterations: 100,
                    },
                    maxVelocity: 5,
                },
                interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click
                layout: { randomSeed: 1337 },
            },
            // node and edge settings
            labels: { Page: { label: "title", size: "clicksInto" } },
            relationships: { LINKS_TO: { value: "quantity" } },
            initialCypher:
                "MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE p1.title = 'Universe' RETURN p1, l, p2 ORDER BY l.quantity",
        };
        const vis: NeoVis = new NeoVis(config);
        vis.render();
        setVis(vis);

        // create event listeners once the visualization is rendered
        vis?.registerOnEvent(NeoVisEvents.CompletionEvent, () => {
            const updateSelectionState = (nodeIds: IdType[]) => {
                // update selection
                setSelection(nodeIds);
                selectionRef.current = nodeIds;

                // update selection labels
                var labels = vis.nodes
                    .get()
                    .filter((node: any) => (nodeIds ? nodeIds.includes(node.id) : ""))
                    .map(({ label }: { label?: any }) => {
                        return label;
                    });
                setSelectionLabels(labels);
            };

            // 1. listener for "select"
            vis.network?.on("select", (e) => {
                var nodeIds = vis.network?.getSelectedNodes();
                if (nodeIds) {
                    updateSelectionState(nodeIds);
                }
            });

            // 2. listener for "click"
            vis.network?.on("click", (e) => {
                setContextMenuState({
                    open: false,
                    type: ContextMenuType.Canvas,
                    mobile: window.innerWidth < 1100,
                    x: 0,
                    y: 0,
                });
            });

            // 3. listener for "double click"
            vis.network?.on("doubleClick", (click) => {
                // if there's a node under the cursor, update visualization with its links
                if (click.nodes.length > 0) {
                    const nodeId = click.nodes[0];
                    var cypher = `MATCH (p1: Page)-[l: LINKS_TO]-(p2: Page) WHERE ID(p1) = ${nodeId} RETURN p1, l, p2`;
                    vis?.updateWithCypher(cypher);
                }
            });

            // 4. listener for "right click"
            vis.network?.on("oncontext", (click) => {
                click.event.preventDefault();

                // TODO: figure out why click.nodes is not accurate on right click
                // get adjusted coordinates to place the context menu
                var rect = click.event.target.getBoundingClientRect();
                let correctedX = click.event.x - rect.x;
                let correctedY = click.event.y - rect.y;

                var type = ContextMenuType.Canvas;
                // check if there's a node under the cursor
                var nodeId = vis.network?.getNodeAt({ x: correctedX, y: correctedY });
                if (nodeId) {
                    // select node that was right-clicked
                    if (selectionRef.current) {
                        vis.network?.selectNodes([...selectionRef.current, nodeId]);
                    } else {
                        vis.network?.selectNodes([nodeId]);
                    }

                    // update selection state
                    const nodeIds = vis.network?.getSelectedNodes();
                    if (nodeIds) {
                        updateSelectionState(nodeIds);
                        nodeIds.length > 1 ? (type = ContextMenuType.Nodes) : (type = ContextMenuType.Node);
                    }
                } else {
                    type = ContextMenuType.Canvas;
                }

                setContextMenuState({
                    open: true,
                    type: type,
                    mobile: window.screen.width < 1100,
                    x: correctedX,
                    y: correctedY,
                });
            });
        });
    }, [containerId, serverDatabase, serverURI, serverUser, serverPassword]);

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
        vis?.renderWithCypher(cypher);
        vis?.network?.moveTo({ position: { x: 0, y: 0 } });
    };

    const addToGraph = () => {
        var cypher =
            'CALL { MATCH (p:Page) WHERE apoc.text.levenshteinSimilarity(p.title, "' +
            input +
            '") > 0.65 RETURN p.title as title ORDER BY apoc.text.levenshteinSimilarity(p.title, "' +
            input +
            '") DESC LIMIT 1 } MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE p1.title = title RETURN p1, l, p2';
        vis?.updateWithCypher(cypher);
        vis?.network?.moveTo({ position: { x: 0, y: 0 } });
    };

    return (
        <>
            {/* graph visualization */}
            <StyledCanvas theme={{ expanded: visIsExpanded }} id="canvas">
                <div id={containerId} />
                <img
                    src={
                        visIsExpanded
                            ? darkMode
                                ? "icons/collapse-white.png"
                                : "icons/collapse.png"
                            : darkMode
                            ? "icons/expand-white.png"
                            : "icons/expand.png"
                    }
                    alt={visIsExpanded ? "Collapse visualization button" : "Expand visualization button"}
                    className="vis-expand-button"
                    onClick={() => setVisIsExpanded(!visIsExpanded)}
                />
                {contextMenuState.mobile && (
                    <img
                        src={
                            contextMenuState.open
                                ? darkMode
                                    ? "icons/close-white.png"
                                    : "icons/close.png"
                                : darkMode
                                ? "icons/kebab-white.png"
                                : "icons/kebab.png"
                        }
                        alt={visIsExpanded ? "Collapse visualization button" : "Expand visualization button"}
                        className="mobile-context-button"
                        onClick={() => {
                            var type;
                            if (selection.length === 0) {
                                type = ContextMenuType.Canvas;
                            } else if (selection.length === 1) {
                                type = ContextMenuType.Node;
                            } else {
                                type = ContextMenuType.Nodes;
                            }
                            setContextMenuState({ ...contextMenuState, open: !contextMenuState.open, type: type });
                        }}
                    />
                )}
                <input
                    type="submit"
                    value="Stabilize"
                    id="stabilize-button"
                    onClick={() => {
                        vis?.stabilize();
                        vis?.network?.fit();
                    }}
                />
                <input type="submit" value="Center" id="center-button" onClick={() => vis?.network?.fit()} />
                <ContextMenu
                    vis={vis}
                    darkMode={darkMode}
                    state={contextMenuState}
                    setState={setContextMenuState}
                    selection={selection}
                    setSelection={setSelection}
                    selectionLabels={selectionLabels}
                    setSelectionLabels={setSelectionLabels}
                    summaries={summaries}
                    setSummaries={setSummaries}
                    setCurrentSummary={setCurrentSummary}
                />
            </StyledCanvas>
            {/* sidebar */}
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
                            <form id="search" action="#" onSubmit={() => createNewGraph}>
                                <input
                                    type="search"
                                    placeholder="Article title"
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <br />
                                <input type="submit" value="Create new graph" onClick={createNewGraph} />
                                <input type="submit" value="Add to graph" onClick={addToGraph} />
                            </form>
                        </div>
                    </>
                )}
                {currentNavTab === NavTab.About && <About />}
                {currentNavTab === NavTab.UserManual && <UserManual />}
            </StyledSidebar>
        </>
    );
};

export default WikiGraph;
