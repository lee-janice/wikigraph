import React, { ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import NeoVis, { NeovisConfig } from "neovis.js/dist/neovis.js";

interface Props {
    width: number, 
    height: number,
    containerId: string,
    serverDatabase: string,
    serverURI: string,
    serverUser: string,
    serverPassword: string,
    search: string
};

const WikiGraph = forwardRef((props: Props, ref: ForwardedRef<HTMLDivElement>) => {
    const { width, height, containerId, serverDatabase, serverURI, serverUser, serverPassword, search } = props;
    const [vis, updateVis] = useState(new NeoVis({
        containerId: "vis",
    }));

	useEffect(() => {
        // TODO: replace this with something that does not open the DB up to an injection attack
		var cypher = 'MATCH (p1:Page)-[l:LINKS_TO]->(p2:Page) \
                    WHERE toLower(p1.title) = toLower("'+search+'") \
                    RETURN p1, l, p2 \
                    ORDER BY l.quantity DESC';

        // TODO: replace with fuzzy match, only return the closest match to the string
        // var cypher = "MATCH (p1:Page)-[l:LINKS_TO]->(p2:Page) \
        // 				WHERE apoc.text.fuzzyMatch(p1.title, '"+article+"') \
        // 				RETURN p1, l, p2 \
        // 				ORDER BY l.quantity DESC \
        // 				LIMIT 10"

        if (cypher.length > 0) {
            vis?.renderWithCypher(cypher);
        } else {
            vis?.reload();
        }
	}, [search]);

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
                        centralGravity: 0.6
                    }, 
                    stabilization: { iterations: 100 }
                },
                interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click 
                layout: {
                    randomSeed: 47,
                    // improvedLayout: true,
                    hierarchical: {
                        // enabled: true,
                        // sortMethod: 'directed',
                        // nodeSpacing: 500,
                        // levelSeparation: 250,
                        // direction: "LR"
                    },
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
            initialCypher: "MATCH (p1:Page)-[l:LINKS_TO]->(p2:Page) \
                            WHERE p1.title = 'Universe' \
                            RETURN p1, l, p2 \
                            ORDER BY l.quantity DESC"
        };
        const vis: NeoVis = new NeoVis(config);
        vis.render();
        updateVis(vis);
        // viz?.network?.on("stabilizationIterationsDone", function () {
        //     viz?.network?.setOptions( { physics: false } );
        // });
        // viz?.network?.setOptions( { physics: false } );
    }, [ containerId, serverDatabase, serverURI, serverUser, serverPassword ]);

    return (
        <div id={containerId} 
            ref={ref}
            style={{ 
                float: `left`,
                width: `${width}px`, 
                height: `${height}px`,
                border: `1px solid lightgray`, 
                display: `inline-block`,
                backgroundColor: `#fffff8`,
            }}
        />
    );
});

export default WikiGraph;