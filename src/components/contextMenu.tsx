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

    if (state.type === "node") {
        return (
            <div 
                className="context-menu" 
                id="context-menu"
                style={!state.open ? {display: `none`} : {
                    position: `absolute`, 
                    left: state.x, 
                    top: state.y,
                    border: `1px solid lightgray`,
                    fontSize: `small`,
                    borderRadius: `5px`,
                    backgroundColor: `white`,
                } }>
                <ul className="context-menu-list">
                    <li className="context-menu-item" onClick={() => console.log("hi")}><a className="context-menu-link" href="#">Load summary from Wikipedia →</a></li>
                    <li className="context-menu-item" onClick={() => console.log("delete")}><a className="context-menu-link" href="#">Delete node</a></li>
                    <hr/>
                    <li className="context-menu-item"><a className="context-menu-link" href="#">Go to Wikipedia page ↗</a></li>
                </ul>
            </div>
        );
    } else if (state.type === "canvas") {
        return (
            <div 
                className="context-menu" 
                id="context-menu"
                style={!state.open ? {display: `none`} : {
                    position: `absolute`, 
                    left: state.x, 
                    top: state.y,
                    border: `1px solid lightgray`,
                    fontSize: `small`,
                    borderRadius: `5px`,
                    backgroundColor: `white`,
                } }>
                <ul className="context-menu-list">
                    <li className="context-menu-item"><a className="context-menu-link" href="#">Open image in new tab</a></li>
                </ul>
            </div>
        );
    } else {
        return (<div></div>);
    }
};

export default ContextMenu;