import React, { useEffect, useRef } from "react";
import NeoVis from "neovis.js/dist/neovis.js";
import './vis.css';

interface Props {
    width: number, 
    height: number,
    containerId: string,
    serverDatabase: string,
    serverURI: string,
    serverUser: string,
    serverPassword: string,
};

const WikiGraph: React.FC<Props> = ({
    width, 
    height, 
    containerId, 
    serverDatabase, 
    serverURI,
    serverUser,
    serverPassword,
}) => {
    useEffect(() => {
        var config = {
            containerId: containerId,
            // neo4j database connection settings 
            serverDatabase: serverDatabase, // specify which database to read from 
            neo4j: {
                serverUrl: serverURI,
                serverUser: serverUser,
                serverPassword: serverPassword
            },
            // override the default vis.js settings 
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
                    barnesHut: { avoidOverlap: 1 }, // value between 0 and 1, 1 is maximum overlap avoidance 
                },
                layout: { randomSeed: 47 },
                interaction: { multiselect: true }, // allows for multi-select using a long press or cmd-click }
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
                            ORDER BY l.quantity DESC \
                            LIMIT 10"
        };
        const viz = new NeoVis(config);
        viz.render();
    }, []);
    return (
        <div id={containerId} 
            style={{ 
                width: `${width}px`, 
                height: `${height}px`,
                border: `1px solid lightgray`, 
                display: `inline-block;`,
            }}
        />
    );
};

export default WikiGraph;