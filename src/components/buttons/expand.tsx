import React from "react";
import { Dispatch, SetStateAction } from "react";

interface Props {
    visIsExpanded: boolean;
    setVisIsExpanded: Dispatch<SetStateAction<boolean>>;
    darkMode: boolean;
}

const ExpandButton: React.FC<Props> = React.memo(({ visIsExpanded, setVisIsExpanded, darkMode }) => {
    return (
        <img
            src={
                visIsExpanded
                    ? darkMode
                        ? "icons/collapse-white.png"
                        : "icons/collapse.png"
                    : darkMode
                    ? "icons/expand-white.png"
                    : "icons/expand.png"
            }
            alt={visIsExpanded ? "Collapse visualization button" : "Expand visualization button"}
            className="vis-expand-button"
            onClick={() => setVisIsExpanded(!visIsExpanded)}
        />
    );
});

export default ExpandButton;
