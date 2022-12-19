import { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import NeoVis, { NeovisConfig, NeoVisEvents } from "neovis.js/dist/neovis.js";
import ContextMenu, { ContextMenuState, ContextMenuType } from "./contextMenu";
import NavBar, { NavTab } from "./sidebar/navbar";
import UserManual from "./sidebar/userManual";
import About from "./sidebar/about";
import WikipediaSummaries, { WikiSummary } from "./sidebar/wikipediaSummaries";

// TODO: figure out how to import this from vis.js
export type IdType = string | number;

interface Props {
    containerId: string;
    serverDatabase: string;
    serverURI: string;
    serverUser: string;
    serverPassword: string;
}

const WikiGraph = forwardRef((props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const { containerId, serverDatabase, serverURI, serverUser, serverPassword } = props;

    // keep vis object in state
    const [vis, setVis] = useState<NeoVis | null>(null);
    const [expandedVis, setExpandedVis] = useState(false);

    // keep track of selected nodes and labels
    const [selection, setSelection] = useState<IdType[]>([]);
    const [selectionLabels, setSelectionLabels] = useState([""]);

    // keep track of summaries
    const [summaries, setSummaries] = useState<WikiSummary[]>([]);
    const [currentSummary, setCurrentSummary] = useState<WikiSummary | null>(null);

    // keep track of search bar input
    const [input, setInput] = useState("");
    const [search, setSearch] = useState("Universe");

    // keep track of nav bar tab state
    const [currentNavTab, setCurrentNavTab] = useState<NavTab>(NavTab.Home);

    // keep track of whether the context menu is open or closed
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({
        open: false,
        type: ContextMenuType.Canvas,
        x: 0,
        y: 0,
    });

    // get reference to selection so that we can use the current value in the vis event listeners
    // otherwise, the value lags behind
    const selectionRef = useRef(selection);

    // ----- initialize visualization and neovis object -----
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
                setContextMenuState({ open: false, type: ContextMenuType.Canvas, x: 0, y: 0 });
            });

            // 3. listener for "double click"
            vis.network?.on("doubleClick", (e) => {
                console.log(e);
                console.log("doubleClicked");
            });

            // 4. listener for "right click"
            vis.network?.on("oncontext", (click) => {
                click.event.preventDefault();

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

                setContextMenuState({ open: true, type: type, x: correctedX, y: correctedY });
            });
        });
    }, [containerId, serverDatabase, serverURI, serverUser, serverPassword]);

    // ----- execute cypher query when user inputs search, update visualization -----
    useEffect(() => {
        // TODO: replace this with something that does not open the DB up to an injection attack
        var cypher =
            'CALL { MATCH (p:Page) WHERE apoc.text.levenshteinSimilarity(p.title, "' +
            search +
            '") > 0.65 RETURN p.title as title ORDER BY apoc.text.levenshteinSimilarity(p.title, "' +
            search +
            '") DESC LIMIT 1 } MATCH (p1:Page)-[l:LINKS_TO]->(p2:Page) WHERE p1.title = title RETURN p1, l, p2 ORDER BY l.quantity DESC LIMIT 10';

        // TODO: only render if the query returns > 0 nodes, otherwise tell user no nodes were found
        if (cypher.length > 0) {
            vis?.renderWithCypher(cypher);
        } else {
            vis?.reload();
        }
    }, [search, vis]);

    return (
        <div>
            {/* graph visualization */}
            <div
                id="canvas"
                style={
                    expandedVis
                        ? {
                              top: "0px",
                              left: "0px",
                              height: `100%`,
                              width: `100%`,
                              position: `fixed`,
                              zIndex: "100000",
                          }
                        : { height: `80%`, width: `60%`, position: `fixed` }
                }
            >
                <div
                    id={containerId}
                    ref={ref}
                    style={{
                        float: `left`,
                        width: `100%`,
                        height: `100%`,
                        border: `1px solid lightgray`,
                        backgroundColor: `white`,
                    }}
                />
                {expandedVis ? (
                    <img
                        src="collapse.png"
                        alt="Collapse visualization button"
                        className="vis-expand-button"
                        onClick={() => setExpandedVis(false)}
                    />
                ) : (
                    <img
                        src="expand.png"
                        alt="Expand visualization button"
                        className="vis-expand-button"
                        onClick={() => setExpandedVis(true)}
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
                    state={contextMenuState}
                    vis={vis}
                    selection={selection}
                    setSelection={setSelection}
                    selectionLabels={selectionLabels}
                    setSelectionLabels={setSelectionLabels}
                    summaries={summaries}
                    setSummaries={setSummaries}
                    setCurrentSummary={setCurrentSummary}
                />
            </div>
            {/* sidebar */}
            <div className="sidebar">
                <NavBar currentNavTab={currentNavTab} setCurrentNavTab={setCurrentNavTab} />
                {/* <SelectedNodes selectionLabels={selectionLabels} /> */}
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
                            <form id="search" action="#" onSubmit={() => setSearch(input)}>
                                <input
                                    type="search"
                                    placeholder="Article title"
                                    onChange={(e) => setInput(e.target.value)}
                                />
                                <input type="submit" value="Submit" onClick={() => setSearch(input)} />
                            </form>
                        </div>
                    </>
                )}
                {currentNavTab === NavTab.About && <About />}
                {currentNavTab === NavTab.UserManual && <UserManual />}
            </div>
        </div>
    );
});

export default WikiGraph;
