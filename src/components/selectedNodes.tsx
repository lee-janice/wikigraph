import React from "react";
import { IdType } from "./wikigraph";

interface Props {
    selection: IdType[] | undefined,
};

const SelectedNodes: React.FC<Props> = ({ selection }) => {
    return (
        <div className="selected-nodes">
            Selected nodes: {selection?.toString()}
        </div>
    );
};

export default SelectedNodes;