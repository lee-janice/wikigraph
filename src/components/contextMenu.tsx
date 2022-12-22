import html2canvas from "html2canvas";
import NeoVis from "neovis.js";
import React, { Dispatch, SetStateAction } from "react";
import { getWikipediaExtract, getWikipediaLink, searchWikipedia } from "../api/wikipedia";
import { WikiSummary } from "./sidebar/wikipediaSummaries";
import { IdType } from "./wikigraph";

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
    vis?: NeoVis | null;
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
            vis?.renderWithCypher(cypher);
            vis?.network?.moveTo({ position: { x: 0, y: 0 } });

            // de-select old nodes once new vis is rendered
            vis?.network?.setSelection({ nodes: [], edges: [] });
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
        // close context menu
        setState({ ...state, open: false });
    };

    // ----- event handler for "Delete nodes" context menu selection -----
    const handleDeleteNode = () => {
        vis?.network?.deleteSelected();
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
                        <li className="context-menu-item" onClick={handleCreateNewGraph}>
                            Create new graph with selection
                        </li>
                        <li className="context-menu-item" onClick={handleLoadSummary}>
                            Load summary from Wikipedia →
                        </li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>
                            Delete node
                        </li>
                        <hr />
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
                        <li className="context-menu-item" onClick={handleCreateNewGraph}>
                            Create new graph with selection
                        </li>
                        <li className="context-menu-item" onClick={handleLoadSummary}>
                            Load summaries from Wikipedia →
                        </li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>
                            Delete nodes
                        </li>
                        <hr />
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
