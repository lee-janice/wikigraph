import React from "react";
import { IdType } from "./wikigraph";

interface Props {
    selectionLabels: string[],
};

const SelectedNodes: React.FC<Props> = ({ selectionLabels }) => {
    return (
        <div className="selected-nodes">
            Selected nodes: <br/>
            <ul className="selected-node-list">
                {selectionLabels.map((label) => {
                    return <li className="bullet">{label}</li>
                })}
            </ul>
        </div>
    );
};

export default SelectedNodes;