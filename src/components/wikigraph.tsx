import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import NeoVis, { NeoVisEvents } from "neovis.js/dist/neovis.js";
import ContextMenu, { ContextMenuState, ContextMenuType } from "./contextMenu";
import { WikiSummary } from "./sidebar/wikipediaSummaries";
import styled from "styled-components";
import { createConfig } from "../util/neo4jConfig";
import Alert, { AlertState, AlertType } from "./alert";

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

// TODO: figure out how to import this from vis.js
export type IdType = string | number;

interface Props {
    vis: NeoVis | null;
    setVis: Dispatch<SetStateAction<NeoVis | null>>;
    containerId: string;
    serverDatabase: string;
    serverURI: string;
    serverUser: string;
    serverPassword: string;
    summaries: WikiSummary[];
    setSummaries: Dispatch<SetStateAction<WikiSummary[]>>;
    setCurrentSummary: Dispatch<SetStateAction<WikiSummary | null>>;
    darkMode: boolean;
}

const WikiGraph: React.FC<Props> = ({
    vis,
    setVis,
    containerId,
    serverDatabase,
    serverURI,
    serverUser,
    serverPassword,
    summaries,
    setSummaries,
    setCurrentSummary,
    darkMode,
}) => {
    const [visIsExpanded, setVisIsExpanded] = useState(false);

    // keep track of selected nodes and labels
    // TODO: combine into one object
    const [selection, setSelection] = useState<IdType[]>([]);
    const [selectionLabels, setSelectionLabels] = useState([""]);

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

    // keep track of record count status
    const [recordCount, setRecordCount] = useState(-1);

    // keep track of alert status
    const [alertState, setAlertState] = useState<AlertState>({
        show: false,
        type: AlertType.None,
    });

    // get reference to selection so that we can use the current value in the vis event listeners
    // otherwise, the value lags behind
    const selectionRef = useRef(selection);

    // so that we only register event listeners once
    const completionRef = useRef(false);

    // ----- initialize visualization and neovis object -----
    // TODO: maybe export to util file?
    useEffect(() => {
        const vis = createConfig(containerId, serverDatabase, serverURI, serverUser, serverPassword);
        vis.render();
        setVis(vis);

        // completion event fires whenever the graph is finished rendering
        vis?.registerOnEvent(NeoVisEvents.CompletionEvent, (e) => {
            // create event listeners the FIRST time the graph renders (i.e., only once on page load)
            if (!completionRef.current) {
                completionRef.current = true;

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
                vis.network?.on("click", (click) => {
                    // close context menu
                    setContextMenuState({
                        open: false,
                        type: ContextMenuType.Canvas,
                        mobile: window.innerWidth < 1100,
                        x: 0,
                        y: 0,
                    });

                    // close alert
                    setAlertState({
                        show: false,
                        type: AlertType.None,
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
            }

            setRecordCount(e.recordCount);
            // close alert if new graph is rendered and record count is > 1
            if (e.recordCount > 1) {
                setAlertState({
                    show: false,
                    type: AlertType.None,
                });
            }
        });
    }, [setVis, containerId, serverDatabase, serverURI, serverUser, serverPassword]);

    // ----- alert user if something went wrong -----
    useEffect(() => {
        // recordCount = number of (new?) nodes returned in the query
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
                }}
            />
            <input type="submit" value="Center" id="center-button" onClick={() => vis?.network?.fit()} />
            <Alert state={alertState}></Alert>
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
    );
};

export default WikiGraph;
