import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import type { IdType } from "vis-network";
import ContextMenu, { ContextMenuState, ContextMenuType } from "./contextMenu";
import { WikiSummary } from "./sidebar/wikipediaSummaries";
import styled from "styled-components";
import Alert, { AlertState, AlertType } from "./alert";
import { VisContext } from "../context/visContext";

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

interface Props {
    containerId: string;
    summaries: WikiSummary[];
    setSummaries: Dispatch<SetStateAction<WikiSummary[]>>;
    setCurrentSummary: Dispatch<SetStateAction<WikiSummary | null>>;
    darkMode: boolean;
}

const WikiGraph: React.FC<Props> = ({ containerId, summaries, setSummaries, setCurrentSummary, darkMode }) => {
    const { vis, visNetwork } = React.useContext(VisContext);
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

    // ----- initialize visualization and neovis object -----
    // TODO: maybe export to util file?
    useEffect(() => {
        if (!vis || !visNetwork) {
            return;
        }

        const updateSelectionState = (nodeIds: IdType[]) => {
            // update selection
            setSelection(nodeIds);
            selectionRef.current = nodeIds;

            // update selection labels
            var labels = vis
                .nodes()
                .get()
                .filter((node: any) => (nodeIds ? nodeIds.includes(node.id) : ""))
                .map(({ label }: { label?: any }) => {
                    return label;
                });
            setSelectionLabels(labels);
        };

        // 1. listener for "select"
        visNetwork.onSelect((e, nodeIds) => {
            if (nodeIds) {
                updateSelectionState(nodeIds);
            }
        });

        // 2. listener for "click"
        visNetwork.onClick((click) => {
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
        visNetwork.onDoubleClick((click) => {
            // if there's a node under the cursor, update visualization with its links
            if (click.nodes.length > 0) {
                const nodeId = click.nodes[0];
                var cypher = `MATCH (p1: Page)-[l: LINKS_TO]-(p2: Page) WHERE ID(p1) = ${nodeId} RETURN p1, l, p2`;
                vis?.updateWithCypher(cypher);
            }
        });

        // 4. listener for "right click"
        visNetwork.onContextClick((click) => {
            click.event.preventDefault();

            // TODO: figure out why click.nodes is not accurate on right click
            // get adjusted coordinates to place the context menu
            var rect = click.event.target.getBoundingClientRect();
            let correctedX = click.event.x - rect.x;
            let correctedY = click.event.y - rect.y;

            var type = ContextMenuType.Canvas;
            // check if there's a node under the cursor
            var nodeId = visNetwork.getNodeAt({ x: correctedX, y: correctedY });
            if (nodeId) {
                // select node that was right-clicked
                if (selectionRef.current) {
                    visNetwork.selectNodes([...selectionRef.current, nodeId]);
                } else {
                    visNetwork.selectNodes([nodeId]);
                }

                // update selection state
                const nodeIds = visNetwork.getSelectedNodes();
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
    }, [vis, visNetwork]);

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
        <StyledCanvas theme={{ expanded: visIsExpanded }} id="canvas">
            <div id={containerId} />
            {!vis && <h2 style={{ position: `absolute`, right: `25px`, bottom: `5px` }}>Loading...</h2>}
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
            <input type="submit" value="Center" id="center-button" onClick={() => visNetwork?.fit()} />
            {/* Move the alert logic to the APP.tsx since it's part of the global state */}
            <Alert state={alertState}></Alert>
            {vis && visNetwork && (
                <ContextMenu
                    vis={vis}
                    visNetwork={visNetwork}
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
            )}
        </StyledCanvas>
    );
};

export default WikiGraph;
