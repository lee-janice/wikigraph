import React from "react";
import { ContextMenuState, ContextMenuType } from "../contextMenu";
import type { IdType } from "vis-network";

interface Props {
    contextMenuState: ContextMenuState;
    selection: IdType[];
    setContextMenuState: (data: ContextMenuState) => void;
    darkMode: boolean;
}

const MobileContextButton: React.FC<Props> = React.memo(
    ({ contextMenuState, setContextMenuState, selection, darkMode }) => {
        return (
            <img
                src={
                    contextMenuState.open
                        ? darkMode
                            ? "icons/close-white.png"
                            : "icons/close.png"
                        : darkMode
                        ? "icons/kebab-white.png"
                        : "icons/kebab.png"
                }
                alt={contextMenuState.open ? "Close context menu button" : "Open context menu button"}
                className="mobile-context-button"
                onClick={() => {
                    var type;
                    if (selection.length === 0) {
                        type = ContextMenuType.Canvas;
                    } else if (selection.length === 1) {
                        type = ContextMenuType.Node;
                    } else {
                        type = ContextMenuType.Nodes;
                    }
                    setContextMenuState({ ...contextMenuState, open: !contextMenuState.open, type: type });
                }}
            />
        );
    }
);

export default MobileContextButton;
