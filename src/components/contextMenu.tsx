import React from "react";

export type ContextMenuState = {
    open: boolean,
    type: string,
    x: number,
    y: number,
}

interface Props {
    state: ContextMenuState,
    handleLoadSummary: () => void,
    handleDeleteNode: () => void,
    handleLaunchWikipediaPage: () => void,
};

const ContextMenu: React.FC<Props> = ({ state, handleLoadSummary, handleDeleteNode, handleLaunchWikipediaPage }) => {
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