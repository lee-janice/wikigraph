import { ForwardedRef, forwardRef, useEffect, useState } from "react";
import NeoVis, { NeovisConfig, NeoVisEvents } from "neovis.js/dist/neovis.js";
import SelectedNodes from "./selectedNodes";
import WikipediaSummaries, { WikiSummary } from "./wikipediaSummaries";
import ContextMenu, { ContextMenuState } from "./contextMenu";

// TODO: figure out how to import this from vis.js
export type IdType = string | number;

interface Props {
    containerId: string,
    serverDatabase: string,
    serverURI: string,
    serverUser: string,
    serverPassword: string,
};

const WikiGraph = forwardRef((props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const {  containerId, serverDatabase, serverURI, serverUser, serverPassword, } = props;
    // TODO: put this all into one state object
    // keep vis object in state
    const [vis, updateVis] = useState<NeoVis|null>(null);
	// keep track of selected nodes and labels
	const [selection, setSelection] = useState<IdType[]|undefined>();
	const [selectionLabels, setSelectionLabels] = useState([""]);
    // keep track of summaries 
    const [summaries, setSummaries] = useState<WikiSummary[]>();
	// keep track of search bar input
	const [input, setInput] = useState("");
	const [search, setSearch] = useState("Universe");
    // keep track of whether the context menu is open or closed
    const [contextMenuState, setContextMenuState] = useState<ContextMenuState>({open: false, type: "canvas", x: 0, y: 0});
    
    // initialize visualization and neovis object
    useEffect(() => {
        var config: NeovisConfig = {
            containerId: containerId,
            // neo4j database connection settings 
            serverDatabase: serverDatabase, // specify which database to read from 
            neo4j: {
                serverUrl: serverURI,
                serverUser: serverUser,
                serverPassword: serverPassword,
                driverConfig: {
                    // enforce encryption 
                    // https://stackoverflow.com/questions/71719427/how-to-visualize-remote-neo4j-auradb-with-neovis-js
                    encrypted: "ENCRYPTION_ON",
                    trust: "TRUST_SYSTEM_CA_SIGNED_CERTIFICATES",
                },
            },
            // override the default vis.js settings 
            // https://visjs.github.io/vis-network/docs/network/#options
            visConfig: {
                nodes: {
                    shape: "circle",
                    color: {
                        background: "lightgray",
                        border: "gray",
                        highlight: {
                            background: "lightgray",
                            border: "gray",
                        },
                    },
                },
                edges: { arrows: { to: { enabled: true, }, }, },
                physics: {
                    // uses the Barnes-Hut algorithm to compute node positions
                    barnesHut: { 
                        avoidOverlap: 1, // value between 0 and 1, 1 is maximum overlap avoidance 
                        gravitationalConstant: -15000,
                        damping: 0.5
                    }, 
                    maxVelocity: 5,
                },
                interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click 
                layout: { randomSeed: 47, },
            },
            // node and edge settings 
            labels: { Page: { label: "title", size: "clicksInto", }, },
            relationships: { LINKS_TO: { value: "quantity", }, },
            initialCypher: "MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE p1.title = 'Universe' RETURN p1, l, p2 ORDER BY l.quantity DESC LIMIT 10"
        };
        const vis: NeoVis = new NeoVis(config);
        vis.render();
        updateVis(vis);

        // create event listeners once the visualization is rendered
        vis?.registerOnEvent(NeoVisEvents.CompletionEvent, () => {
            // listener for "select"
            vis.network?.on("select", (e) => {
                var selection = vis.network?.getSelectedNodes();
                var nodes = vis.nodes.get();
                if (selection) {
                    setSelection(selection);
                    var labels = nodes
                        .filter((node: any) => selection ? selection.includes(node.id) : "")
                        .map(({label}: {label?: any}) => {return label});
                    setSelectionLabels(labels);
                }
            });

            // listener for "click"j
            vis.network?.on("click", (e) => {
                setContextMenuState({open: false, type: "canvas", x: 0, y: 0});
            });

            // listener for "double click"
            vis.network?.on("doubleClick", (e) => {
                console.log(e);
                console.log("doubleClicked");
            });

            // listener for "right click"
            vis.network?.on("oncontext", (click) => {
                click.event.preventDefault();

                var rect = click.event.target.getBoundingClientRect();
                let correctedX = click.event.x - rect.x; 
                let correctedY = click.event.y - rect.y;

                var node = vis.network?.getNodeAt({x: correctedX, y: correctedY});
                var type = node ? "node" : "canvas";
                setContextMenuState({open: true, type: type, x: correctedX, y: correctedY});
            });
        })

    }, [ containerId, serverDatabase, serverURI, serverUser, serverPassword ]);

    const handleUpdateWithSelection = () => {
        if (selection) {
            var cypher = 'MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE toString(ID(p1)) IN split("'+selection+'", ",") RETURN p1, l, p2 ORDER BY l.quantity DESC LIMIT '+10*selection.length;
            vis?.renderWithCypher(cypher);
            // reset selection state once graph is re-rendered
            setSelection([""]);
            setSelectionLabels([""]);
        }
    };

    const handleWikipediaSearch = async () => {
        async function searchWikipedia(searchQuery: string): Promise<{title: string, pageid: string}> {
            const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${searchQuery}&origin=*`;

            const response = await fetch(endpoint);
            // if request failed, throw an error
            if (!response.ok) {
              throw Error(response.statusText);
            }

            const json = await response.json();
            // if no search results returned, throw an error 
            if (json.query.search.length === 0) {
                throw Error(`No Wikipedia articles for ${searchQuery} were found.`);
            }

            // return the Page ID of the best match
            const bestMatch = json.query.search[0];
            return {title: bestMatch.title, pageid: bestMatch.pageid.toString()} ;
        };

        async function getWikipediaExtract(pageid: string) {
            const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageid}&origin=*`;

            const response = await fetch(endpoint);
            // if request failed, throw an error
            if (!response.ok) {
              throw Error(response.statusText);
            }

            const json = await response.json();
            // setSummaryTitles([...summaryTitles, title]);
            // setSummaries([...summaries, json.query.pages[pageid].extract]);
            return json.query.pages[pageid].extract;
        };

        // if (selectionLabels) {
        var summaries: Array<WikiSummary> = [];
        // var extracts: Array<string> = [];
        // console.log(selectionLabels);
        selectionLabels.map(async (label) => {
            const result = await searchWikipedia(label); 
            summaries.push({
                title: result.title,
                text: await getWikipediaExtract(result.pageid),
                display: true,
            })
            // titles.push(result.title);
            // extracts.push(await getWikipediaExtract(result.pageid));
            // const extract = await getWikipediaExtract(await searchWikipedia(label));
            // extracts.push(extract);
            // await getWikipediaExtract(await searchWikipedia(label));
        });

        // setSummaryTitles(titles);
        setSummaries(summaries);
        console.log(summaries);

        // setSummaries(extracts);
        // setSummaryTitles(selectionLabels);
        // console.log(extract);
        // }
    }

    const handleLoadSummary = () => {
        
    }

    // execute cypher query when user inputs search, update visualization
	useEffect(() => {
        // TODO: replace this with something that does not open the DB up to an injection attack
		var cypher = 'MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE toLower(p1.title) = toLower("'+search+'") RETURN p1, l, p2 ORDER BY l.quantity DESC LIMIT 10';

        // TODO: replace with fuzzy match, only return the closest match to the string
        // var cypher = "MATCH (p1:Page)-[l:LINKS_TO]->(p2:Page) WHERE apoc.text.fuzzyMatch(p1.title, '"+article+"') RETURN p1, l, p2 ORDER BY l.quantity DESC LIMIT 10"

        // TODO: only render if the query returns > 0 nodes, otherwise tell user no nodes were found
        if (cypher.length > 0) {
            vis?.renderWithCypher(cypher);
        } else {
            vis?.reload();
        }
	}, [search, vis]);

    return (
        <div>
        {/* graph visualization */}
        <div id="canvas" style={{ height: `80%`, width: `60%`, position: `fixed`, }}>
            <div id={containerId} 
                ref={ref}
                style={{ 
                    float: `left`,
                    width: `100%`,
                    height: `100%`,
                    border: `1px solid lightgray`, 
                    // backgroundColor: `#fffff8`,
                    backgroundColor: `white`,
                }}
            />
            <input type="submit" value="Stabilize" id="stabilize-button" onClick={() => vis?.stabilize()}/>
            <input type="submit" value="Center" id="center-button" onClick={() => vis?.network?.fit()}/>
            <ContextMenu state={contextMenuState}/>
        </div>
        {/* sidebar */}
        <div className="sidebar">
            <SelectedNodes selectionLabels={selectionLabels}/>
            <input type="submit" value="Update Graph with Selection" onClick={handleUpdateWithSelection}/>
            <input type="submit" value="Get Wikipedia Summaries" onClick={handleWikipediaSearch}/>
            <WikipediaSummaries summaries={summaries}/>
            <div className="search-bar">
                Search for a Wikipedia article:<br/>
                <form id="search" action="#" onSubmit={() => setSearch(input)}>
                    <input type="search" placeholder="Article title" onChange={(e) => setInput(e.target.value)}/>
                    <input type="submit" value="Submit" onClick={() => setSearch(input)}/>
                </form>
            </div>
        </div>
        </div>
    );
});

export default WikiGraph;