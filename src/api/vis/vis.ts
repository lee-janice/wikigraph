import type { Network, IdType } from 'vis-network';
import NeoVis, { NeoVisEvents } from 'neovis.js/dist/neovis.js';
import { createConfig } from './neo4jConfig';

type Callback = (e: any) => void;

interface VisNetworkEvents {
	onSelect(callback: (e: any, nodeIds: IdType[]) => void): void;
	onClick(callback: Callback): void;
	onDoubleClick(callback: Callback): void;
	onContextClick(callback: Callback): void;
	selectNodes(nodeIds: IdType[], highlightEdges?: boolean): void;
}

const CONTAINER_ID = 'vis';
const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

export class VisNetwork implements VisNetworkEvents {
	constructor(private readonly network: Network) {}

	onSelect(callback: (e: any, nodeIds: IdType[]) => void): void {
		const nodeIds = this.network.getSelectedNodes();

		this.network.on('select', (e) => {
			callback(e, nodeIds);
		});
	}

	onClick(callback: Callback): void {
		this.network.on('click', (e) => {
			callback(e);
		});
	}

	onDoubleClick(callback: Callback): void {
		this.network.on('doubleClick', (e) => {
			callback(e);
		});
	}

	onContextClick(callback: Callback): void {
		this.network.on('oncontext', (e) => {
			callback(e);
		});
	}

	selectNodes(nodeIds: IdType[], highlightEdges?: boolean) {
		this.network.selectNodes(nodeIds, highlightEdges);
	}
}

/*
export class Vis implements VisEvents {
    // implement this class same as VisNetwork. The idea here is that
    // we only expose the API calls used in this APP, so that you
    // don't expose the low-level APIs everywhere. Other benefits are
    // 1. you can add in extra logic before firing the low-level API calls
    // so to reduce some boilerplates
    // 2. Managing external APIs in one place, so if there are changes
    // in the future, you can modify them in one go
}
*/

class VisLoader {
	private vis: NeoVis | undefined;

	constructor() {}

	load(onReady: (vis: NeoVis, e: any) => void) {
		if (!this.vis) {
			this.vis = createConfig(CONTAINER_ID, NEO4J_DB, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD);
			this.vis.render();
			this.vis.registerOnEvent(NeoVisEvents.CompletionEvent, (e) => {
				if (!this.vis || !this.vis.network) {
					throw new Error('vis is not ready');
				}
				onReady(this.vis, e);
                return this.vis;
			});
		}
        return this.vis;
	}
}

const visLoader = new VisLoader();

export { visLoader };
