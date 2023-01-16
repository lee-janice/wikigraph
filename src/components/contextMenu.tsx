import html2canvas from "html2canvas";
import { Node } from "neovis.js";
import type { IdType } from "vis-network";
import React, { Dispatch, SetStateAction } from "react";
import { getWikipediaExtract, getWikipediaLink, searchWikipedia } from "../api/wikipedia";
import { WikiSummary } from "./sidebar/wikipediaSummaries";
import { Vis, VisNetwork } from "../api/vis/vis";

export enum ContextMenuType {
    Node,
    Nodes,
    Canvas,
}

export type ContextMenuState = {
    open: boolean;
    type: ContextMenuType;
    mobile: boolean;
    x: number;
    y: number;
};

interface Props {
    vis: Vis;
    visNetwork: VisNetwork;
    darkMode: boolean;
    state: ContextMenuState;
    setState: Dispatch<SetStateAction<ContextMenuState>>;
    selection: IdType[];
    setSelection: Dispatch<SetStateAction<IdType[]>>;
    selectionLabels: string[];
    setSelectionLabels: Dispatch<SetStateAction<string[]>>;
    summaries: WikiSummary[];
    setSummaries: Dispatch<SetStateAction<WikiSummary[]>>;
    setCurrentSummary: Dispatch<SetStateAction<WikiSummary | null>>;
}

const ContextMenu: React.FC<Props> = ({
    vis,
    visNetwork,
    darkMode,
    state,
    setState,
    selection,
    setSelection,
    selectionLabels,
    setSelectionLabels,
    summaries,
    setSummaries,
    setCurrentSummary,
}) => {
    const style = !state.open
        ? { display: `none` }
        : {
              // https://stackoverflow.com/questions/70206356/makestyles-throwing-error-using-typescript
              position: `absolute` as `absolute`,
              left: state.mobile ? `undefined` : state.x,
              right: state.mobile ? `10px` : `undefined`,
              top: state.mobile ? `92px` : state.y,
              border: `1px solid var(--borderColor)`,
              fontSize: `small`,
              borderRadius: `5px`,
              backgroundColor: darkMode ? `#202122f2` : `#fffffff2`,
          };

    // ----- event handler for "Update Graph with Selection" button press -----
    const handleCreateNewGraph = () => {
        if (selection) {
            var cypher =
                'MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE toString(ID(p1)) IN split("' +
                selection +
                '", ",") RETURN p1, l, p2';
            vis.renderWithCypher(cypher);
            visNetwork.moveTo({ position: { x: 0, y: 0 } });

            // de-select old nodes once new vis is rendered
            visNetwork.setSelection({ nodes: [], edges: [] });
            // reset selection state once new vis is re-rendered
            setSelection([]);
            setSelectionLabels([]);

            // close context menu
            setState({ ...state, open: false });
        }
    };

    // ----- event handler for "Load summaries from Wikipedia" context menu selection -----
    const handleLoadSummary = async () => {
        var s: WikiSummary[] = [...summaries];
        await Promise.all(
            selectionLabels.map(async (label) => {
                // only get the summary if it is not already loaded
                if (s.filter((summary) => summary.title === label).length === 0) {
                    const result = await searchWikipedia(label);
                    const summary = {
                        title: result.title,
                        text: await getWikipediaExtract(result.pageid),
                        link: await getWikipediaLink(result.pageid),
                    };
                    // if it is the first summary generated so far, set it to the current summary
                    if (s.length === 0) {
                        setCurrentSummary(summary);
                    }
                    s.unshift(summary);
                }
            })
        );
        setSummaries(s);
        setCurrentSummary(s[0]);
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Keep selected nodes" context menu selection -----
    const handleKeepNode = () => {
        // get array of all selected nodes
        const selection = visNetwork.getSelectedNodes();
        // for each node in the graph, check if it is in the nodes we should keep, delete if not
        vis.nodes().forEach((node: Node) => {
            if (!selection.includes(node.id)) {
                vis.nodes().remove(node.id);
            }
        });
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Expand node links" context menu selection -----
    const handleExpandNode = () => {
        var cypher = `MATCH (p1: Page)-[l: LINKS_TO]-(p2: Page) WHERE ID(p1) IN [${visNetwork
            ?.getSelectedNodes()
            .toString()}] RETURN p1, l, p2`;
        vis?.updateWithCypher(cypher);
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Delete nodes" context menu selection -----
    const handleDeleteNode = () => {
        // get array of all nodes connected to the nodes to delete
        const selection = visNetwork.getSelectedNodes();
        var connected: Array<any> = [];
        selection.forEach((sId) => {
            connected = connected.concat(visNetwork.getConnectedNodes(sId));
        });

        // delete selected nodes
        visNetwork.deleteSelected();

        // for each connected node, check if it is detached, and delete if so
        connected.forEach((cId) => {
            // have to get around the weird typing of .getConnectedNodes
            if (typeof cId === "string" || typeof cId === "number") {
                if (visNetwork.getConnectedNodes(cId).length === 0) {
                    vis.nodes().remove(cId);
                }
            }
        });
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Find path between nodes" context menu selection -----
    const findPathBetweenNodes = () => {
        const p1ID = visNetwork.getSelectedNodes()[0].toString();
        const p2ID = visNetwork.getSelectedNodes()[1].toString();
        var cypher = `MATCH (p1: Page), (p2: Page) WHERE ID(p1) = ${p1ID} AND ID(p2) = ${p2ID} MATCH path = shortestPath((p1)-[*]-(p2)) RETURN path`;
        vis.updateWithCypher(cypher);
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Launch Wikipedia page" context menu selection -----
    const handleLaunchWikipediaPage = async () => {
        await Promise.all(
            selectionLabels.map(async (label) => {
                const result = await searchWikipedia(label);
                window.open(await getWikipediaLink(result.pageid), "_blank");
            })
        );
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Open image in new tab" context menu selection -----
    const handleOpenImage = () => {
        const canvas = document.getElementsByTagName("canvas")[0] as HTMLCanvasElement;
        if (canvas) {
            const vis = document.getElementById("vis");
            html2canvas(canvas, { width: vis?.offsetWidth, height: vis?.offsetHeight }).then((canvas) => {
                window.open(canvas.toDataURL());
            });
        }
        // close context menu
        setState({ ...state, open: false });
    };

    switch (state.type) {
        case ContextMenuType.Node:
            return (
                <div className="context-menu" id="context-menu" style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleLoadSummary}>
                            Load summary from Wikipedia {state.mobile ? "↓" : "→"}
                        </li>
                        {/* line */}
                        <hr />
                        {/* line */}
                        <li className="context-menu-item" onClick={handleCreateNewGraph}>
                            Create new graph with selection
                        </li>
                        <li className="context-menu-item" onClick={handleKeepNode}>
                            Keep selected node
                        </li>
                        <li className="context-menu-item" onClick={handleExpandNode}>
                            Expand node links
                        </li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>
                            Delete node
                        </li>
                        {/* line */}
                        <hr />
                        {/* line */}
                        <li className="context-menu-item" onClick={handleLaunchWikipediaPage}>
                            <img
                                src={darkMode ? "icons/wikipedia-white.png" : "icons/wikipedia.png"}
                                alt=""
                                style={{ height: "1.2em", verticalAlign: "bottom" }}
                            />{" "}
                            Launch Wikipedia page ↗
                        </li>
                    </ul>
                </div>
            );
        case ContextMenuType.Nodes:
            return (
                <div className="context-menu" id="context-menu" style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleLoadSummary}>
                            Load summaries from Wikipedia {state.mobile ? "↓" : "→"}
                        </li>
                        {/* line */}
                        <hr />
                        {/* line */}
                        <li className="context-menu-item" onClick={handleCreateNewGraph}>
                            Create new graph with selection
                        </li>
                        <li className="context-menu-item" onClick={handleKeepNode}>
                            Keep selected nodes
                        </li>
                        <li className="context-menu-item" onClick={handleExpandNode}>
                            Expand node links
                        </li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>
                            Delete nodes
                        </li>
                        {/* line */}
                        <hr />
                        {/* line */}
                        {visNetwork.getSelectedNodes().length === 2 && (
                            <li className="context-menu-item" onClick={findPathBetweenNodes}>
                                Find path between nodes
                            </li>
                        )}
                        {/* line */}
                        <hr />
                        {/* line */}
                        <li className="context-menu-item" onClick={handleLaunchWikipediaPage}>
                            <img
                                src={darkMode ? "icons/wikipedia-white.png" : "icons/wikipedia.png"}
                                alt=""
                                style={{ height: "1.2em", verticalAlign: "bottom" }}
                            />{" "}
                            Launch Wikipedia pages ↗
                        </li>
                    </ul>
                </div>
            );
        case ContextMenuType.Canvas:
            return (
                <div className="context-menu" id="context-menu" style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleOpenImage}>
                            Open image in new tab
                        </li>
                    </ul>
                </div>
            );
        default:
            return <div></div>;
    }
};

export default ContextMenu;
