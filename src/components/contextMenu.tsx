import React from "react";

export type ContextMenuState = {
    open: boolean,
    type: string,
    x: number,
    y: number
}

interface Props {
    state: ContextMenuState,
};

const ContextMenu: React.FC<Props> = ({ state }) => {
    const handleLoadSummary = () => {

    };

    const style = !state.open ? {display: `none`} : {
        position: `absolute` as `absolute`, // https://stackoverflow.com/questions/70206356/makestyles-throwing-error-using-typescript
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
                        <li className="context-menu-item" onClick={() => console.log("hi")}><a className="context-menu-link" href="#">Load summary from Wikipedia →</a></li>
                        <li className="context-menu-item" onClick={() => console.log("delete")}><a className="context-menu-link" href="#">Delete node</a></li>
                        <hr/>
                        <li className="context-menu-item"><a className="context-menu-link" href="#">Go to Wikipedia page ↗</a></li>
                    </ul>
                </div>
            );
        case "selection": 
            return (
                <div 
                    className="context-menu" 
                    id="context-menu"
                    style={style}>
                    <ul className="context-menu-list">
                        <li className="context-menu-item" onClick={() => console.log("hi")}><a className="context-menu-link" href="#">Load summaries from Wikipedia →</a></li>
                        <li className="context-menu-item" onClick={() => console.log("delete")}><a className="context-menu-link" href="#">Delete nodes</a></li>
                        <hr/>
                        <li className="context-menu-item"><a className="context-menu-link" href="#">Open Wikipedia pages ↗</a></li>
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