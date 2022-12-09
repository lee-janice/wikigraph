import React from "react";

interface Props {
    selectionLabels: string[],
};

const SelectedNodes: React.FC<Props> = ({ selectionLabels }) => {
    return (
        <div className="selected-nodes">
            Selected nodes: <br/>
            <ul id="selected-node-list">
                {selectionLabels.map((label) => {
                    return <li key={label}>{label}</li>
                })}
            </ul>
        </div>
    );
};

export default SelectedNodes;