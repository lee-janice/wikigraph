import type { Network, IdType, Position, MoveToOptions, SelectionOptions, DirectionType } from "vis-network";
import NeoVis, { Cypher, NeoVisEvents, Node } from "neovis.js/dist/neovis.js";
import { createConfig } from "./neo4jConfig";
import type * as VN from "vis-network";

type Callback = (e: any) => void;

interface VisNetworkEvents {
    // event listeners
    onSelect(callback: (e: any, nodeIds: IdType[]) => void): void;
    onClick(callback: Callback): void;
    onDoubleClick(callback: Callback): void;
    onContextClick(callback: Callback): void;

    // getters
    getNodeAt(position: Position): IdType;
    getSelectedNodes(): IdType[];
    getConnectedNodes(
        nodeOrEdgeId: IdType,
        direction?: DirectionType
    ): IdType[] | Array<{ fromId: IdType; toId: IdType }>;

    // node manipulation
    selectNodes(nodeIds: IdType[], highlightEdges?: boolean): void;
    setSelection(selection: { nodes?: IdType[]; edges?: IdType[] }, options?: SelectionOptions): void;
    deleteSelected(): void;

    // camera manipulation
    fit(): void;
    moveTo(options: MoveToOptions): void;
}

interface VisEvents {
    nodes(): VN.DataSet<Node>;
    renderWithCypher(query: Cypher): void;
    updateWithCypher(query: Cypher): void;
    stabilize(): void;
}

const CONTAINER_ID = "vis";
const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

export class VisNetwork implements VisNetworkEvents {
    constructor(private readonly network: Network) {}

    // ----- event listeners -----
    onSelect(callback: (e: any, nodeIds: IdType[]) => void): void {
        this.network.on("select", (e) => {
            const nodeIds = this.network.getSelectedNodes();
            callback(e, nodeIds);
        });
    }

    onClick(callback: Callback): void {
        this.network.on("click", (e) => {
            callback(e);
        });
    }

    onDoubleClick(callback: Callback): void {
        this.network.on("doubleClick", (e) => {
            callback(e);
        });
    }

    onContextClick(callback: Callback): void {
        this.network.on("oncontext", (e) => {
            callback(e);
        });
    }

    // ----- getters -----
    getNodeAt(position: Position): IdType {
        return this.network.getNodeAt(position);
    }

    getSelectedNodes(): IdType[] {
        return this.network.getSelectedNodes();
    }

    getConnectedNodes(
        nodeOrEdgeId: IdType,
        direction?: DirectionType
    ): IdType[] | Array<{ fromId: IdType; toId: IdType }> {
        return this.network.getConnectedNodes(nodeOrEdgeId, direction);
    }

    // ----- node manipulation -----
    setSelection(selection: { nodes?: IdType[]; edges?: IdType[] }, options?: SelectionOptions) {
        this.network.setSelection(selection, options);
    }

    selectNodes(nodeIds: IdType[], highlightEdges?: boolean) {
        this.network.selectNodes(nodeIds, highlightEdges);
    }

    deleteSelected(): void {
        this.network.deleteSelected();
    }

    // ----- camera manipulation -----
    fit(): void {
        this.network.fit();
    }

    moveTo(options: MoveToOptions): void {
        this.network.moveTo(options);
    }
}

export class Vis implements VisEvents {
    // implement this class same as VisNetwork. The idea here is that
    // we only expose the API calls used in this APP, so that you
    // don't expose the low-level APIs everywhere. Other benefits are
    // 1. you can add in extra logic before firing the low-level API calls
    // so to reduce some boilerplates
    // 2. Managing external APIs in one place, so if there are changes
    // in the future, you can modify them in one go
    constructor(private readonly vis: NeoVis) {}

    nodes(): VN.DataSet<Node> {
        return this.vis.nodes;
    }

    renderWithCypher(query: Cypher): void {
        this.vis.renderWithCypher(query);
    }

    updateWithCypher(query: Cypher): void {
        this.vis.updateWithCypher(query);
    }

    stabilize(): void {
        this.vis.stabilize();
    }
}

class VisLoader {
    private vis: NeoVis | undefined;
    public loaded: boolean = false;

    load(onReady: (vis: NeoVis, e: any) => void) {
        if (!this.vis) {
            this.vis = createConfig(CONTAINER_ID, NEO4J_DB, NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD);
            this.vis.render();
            this.vis.registerOnEvent(NeoVisEvents.CompletionEvent, (e) => {
                if (!this.vis || !this.vis.network) {
                    throw new Error("vis is not ready");
                }
                // we need this flag because CompletionEvent is fired every time the vis updates
                // but we should only call onReady the first time the vis renders, i.e. when it loads
                if (!this.loaded) {
                    onReady(this.vis, e);
                }
                this.loaded = true;
                return this.vis;
            });
        }
        return this.vis;
    }
}

const visLoader = new VisLoader();

export { visLoader };
