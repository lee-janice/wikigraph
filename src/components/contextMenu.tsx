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
};

const ContextMenu: React.FC<Props> = ({ state, handleLoadSummary, handleDeleteNode }) => {
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
            // TODO: change message based on number of nodes selected
            return (
                <div 
                    className="context-menu" 
                    id="context-menu"
                    style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleLoadSummary}>Load summary/ies from Wikipedia →</li>
                        <li className="context-menu-item" onClick={handleDeleteNode}>Delete node(s)</li>
                        <hr/>
                        <li className="context-menu-item">Go to Wikipedia page(s) ↗</li>
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