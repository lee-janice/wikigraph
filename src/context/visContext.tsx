import NeoVis from 'neovis.js/dist/neovis.js';
import { VisNetwork } from '../api/vis/vis';
import React from 'react';

interface VisContextProps {
	vis: NeoVis | null;
    visNetwork: VisNetwork | null;
}

const defaultValue: VisContextProps = {
	vis: null,
    visNetwork: null,
};

export const VisContext = React.createContext(defaultValue);