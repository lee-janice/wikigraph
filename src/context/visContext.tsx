import { Vis, VisNetwork } from "../api/vis/vis";
import React from "react";

interface VisContextProps {
    vis: Vis | null;
    visNetwork: VisNetwork | null;
}

const defaultValue: VisContextProps = {
    vis: null,
    visNetwork: null,
};

export const VisContext = React.createContext(defaultValue);
