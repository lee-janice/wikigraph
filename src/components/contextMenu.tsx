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
            return (
                <div 
                    className="context-menu" 
                    id="context-menu"
                    style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={handleLoadSummary}><a className="context-menu-link" href="#">Load summary from Wikipedia →</a></li>
                        <li className="context-menu-item" onClick={handleDeleteNode}><a className="context-menu-link" href="#">Delete node(s)</a></li>
                        <hr/>
                        <li className="context-menu-item"><a className="context-menu-link" href="#">Go to Wikipedia page(s) ↗</a></li>
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
                        <li className="context-menu-item"><a className="context-menu-link" href="#">Open image in new tab</a></li>
                    </ul>
                </div>
            );
        default: return <div></div>
    }
};

export default ContextMenu;