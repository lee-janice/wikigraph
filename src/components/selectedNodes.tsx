import React, {useEffect} from "react";

interface Props {
    selection: string[],
};

const SelectedNodes: React.FC<Props> = ({ selection }) => {
    useEffect(() => {}, []);
    return (
        <div className="selected-nodes">
            Selected nodes: {selection.toString()}
        </div>
    );
};

export default SelectedNodes;