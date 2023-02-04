import React from "react";
import { Vis } from "../../api/vis/vis";

interface Props {
    vis: Vis | null;
}

const StabilizeButton: React.FC<Props> = React.memo(({ vis }) => {
    return (
        <input
            type="submit"
            value="Stabilize"
            id="stabilize-button"
            onClick={() => {
                vis?.stabilize();
            }}
        />
    );
});

export default StabilizeButton;
