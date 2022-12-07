import { ForwardedRef, forwardRef, useEffect, useState } from "react";
import NeoVis, { NeovisConfig } from "neovis.js/dist/neovis.js";

export type IdType = string | number;

interface Props {
    containerId: string,
    serverDatabase: string,
    serverURI: string,
    serverUser: string,
    serverPassword: string,
    search: string,
    stabilize: boolean,
    handleStabilize: (a: boolean) => void,
    handleSelect: (a: IdType[] | undefined) => void,
};

const WikiGraph = forwardRef((props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const {  containerId, serverDatabase, serverURI, serverUser, serverPassword, 
        search, stabilize, handleStabilize, handleSelect, } = props;
    const [vis, updateVis] = useState<NeoVis|null>(null);

    // initialize visualization and neovis object
    useEffect(() => {
        var config: NeovisConfig = {
            // nonFlat: true, 
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
                        // centralGravity: 0.6
                    }, 
                    // hierarchicalRepulsion: {
                    //     avoidOverlap: 0.6, // value between 0 and 1, 1 is maximum overlap avoidance 
                    //     nodeDistance: 300
                    // },
                    maxVelocity: 15,
                    // stabilization: { iterations: 100 }
                },
                interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click 
                layout: {
                    randomSeed: 47,
                    // improvedLayout: true,
                },
            },
            // node and edge settings 
            labels: {
                Page: {
                    label: "title",
                    size: "clicksInto",
                },
            },
            relationships: {
                LINKS_TO: {
                    value: "quantity",
                },
            },
            initialCypher: "MATCH (p1:Page)-[l:LINKS_TO]-(p2:Page) WHERE p1.title = 'Universe' RETURN p1, l, p2 ORDER BY l.quantity DESC LIMIT 10"
        };
        const vis: NeoVis = new NeoVis(config);
        vis.render();
        updateVis(vis);
        // vis?.network?.on("stabilizationIterationsDone", function () {
        //     vis?.network?.setOptions( { physics: false } );
        // });
        // vis?.network?.setOptions( { physics: false } );
    }, [ containerId, serverDatabase, serverURI, serverUser, serverPassword ]);

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

    // execute cypher query when user inputs search, update visualization
	useEffect(() => {
        // vis?.stabilize();
        console.log(vis?.stabilize)
        handleStabilize(false);
	}, [stabilize, vis]);

    // if user clicks on the visualization, update the parent "selection" state
    const handleClick = () => {
        handleSelect(vis?.network?.getSelectedNodes());
    }

    return (
        <div style={{
            height: `80%`,
            width: `60%`, 
            position: `fixed`,
        }}>
            <div id={containerId} 
                ref={ref}
                style={{ 
                    float: `left`,
                    width: `100%`,
                    height: `100%`,
                    border: `1px solid lightgray`, 
                    backgroundColor: `#fffff8`,
                }}
                onClick={handleClick}
            />
            <input type="submit" value="Stabilize" id="stabilize" onClick={() => vis?.stabilize()}/>
        </div>
    );
});

export default WikiGraph;