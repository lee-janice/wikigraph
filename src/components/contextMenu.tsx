import NeoVis from "neovis.js";
import React, { Dispatch, SetStateAction } from "react";
import { getWikipediaExtract, getWikipediaLink, searchWikipedia, WikiSummary } from "./wikipediaSummaries";

export type ContextMenuState = {
    open: boolean,
    type: string,
    x: number,
    y: number,
}

interface Props {
    state: ContextMenuState,
    vis?: NeoVis|null,
    selectionLabels: string[],
    setSummaries: Dispatch<SetStateAction<WikiSummary[] | undefined>>,
};

// const ContextMenu: React.FC<Props> = ({ state, handleLoadSummary, handleDeleteNode, handleLaunchWikipediaPage }) => {
const ContextMenu: React.FC<Props> = ({ state, vis, selectionLabels, setSummaries }) => {
    const style = !state.open ? {display: `none`} : {
        // https://stackoverflow.com/questions/70206356/makestyles-throwing-error-using-typescript
        position: `absolute` as `absolute`, 
        left: state.x, 
        top: state.y,
        border: `1px solid lightgray`,
        fontSize: `small`,
        borderRadius: `5px`,
        backgroundColor: `white`,
    }

    // event handler for "Load summaries from Wikipedia" context menu selection
    const handleLoadSummary = async () => {
        var summaries: Array<WikiSummary> = [];
        await Promise.all(selectionLabels.map(async (label) => {
            const result = await searchWikipedia(label); 
            summaries.push({
                title: result.title,
                text: await getWikipediaExtract(result.pageid),
                display: true,
            });
        }));
        setSummaries(summaries);
        // console.log(summaries);
    };

    // event handler for "Delete nodes" context menu selection
    const handleDeleteNode = () => { 
        vis?.network?.deleteSelected();
    };

    // event handler for "Launch Wikipedia page" context menu selection
    const handleLaunchWikipediaPage = async () => { 
        await Promise.all(selectionLabels.map(async (label) => {
            const result = await searchWikipedia(label); 
            window.open(await getWikipediaLink(result.pageid), '_blank');
        }));
    };

    switch (state.type) {
        case "node": 
            return (
                <div 
                    className="context-menu" 
                    id="context-menu"
                    style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleLoadSummary}>Load summary from Wikipedia →</li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>Delete node</li>
                        <hr/>
                        <li className="context-menu-item" onClick={handleLaunchWikipediaPage}>Launch Wikipedia page ↗</li>
                    </ul>
                </div>
            );
        case "nodes": 
            return (
                <div 
                    className="context-menu" 
                    id="context-menu"
                    style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleLoadSummary}>Load summaries from Wikipedia →</li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>Delete nodes</li>
                        <hr/>
                        <li className="context-menu-item" onClick={handleLaunchWikipediaPage}>Launch Wikipedia pages ↗</li>
                    </ul>
                </div>
            );
        case "canvas": 
            return (
                <div 
                    className="context-menu" 
                    id="context-menu"
                    style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item">Open image in new tab</li>
                    </ul>
                </div>
            );
        default: return <div></div>
    }
};

export default ContextMenu;