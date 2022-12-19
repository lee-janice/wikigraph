import React from "react";

const About: React.FC = () => {
    return (
        <div className="sidebar-content">
            {/* Introduction */}
            <h1>About this tool</h1>
            <p>
                Welcome to WikiGraph! This tool is my first attempt at implementing a non-linear, graph-based approach
                to knowledge and concept exploration.
            </p>
            {/* Background */}
            <h2>Background</h2>
            <p>
                I've long been a fan of using large swaths of blank paper for "thinking" tasks such as exploring,
                brainstorming, and drafting. It's far more{" "}
                <em>
                    <a href="https://en.wikipedia.org/wiki/Cognitive_ergonomics" target="_blank" rel="noreferrer">
                        cognitively ergonomic
                    </a>
                </em>
                ↗ for me to be able to scribble all over the page and jot down the free-flowing connections from my
                brain onto the paper, instead of being constricted by rows of ossifying lines.
            </p>
            <p>
                As such, I've lamented the linear form that the majority of text- and web-based content takes to-date:
                here we stand, with access to an unprecedented amount of information, and yet here we lie, made to
                process it in the constricting "top-down, left-to-right" manner of yesteryear. In an attempt to break
                free of this mold, I've combined my love for the great site of{" "}
                <a href="https://www.wikipedia.org/" target="_blank" rel="noreferrer">
                    Wikipedia
                </a>
                ↗ with the benefits of a non-linear interface in order to develop this tool.
            </p>
            {/* Data */}
            <h2>Data</h2>
            <p>
                Let's chat a bit about what information is actually displayed here. This tool utilizes{" "}
                <a
                    href="https://meta.wikimedia.org/wiki/Research:Wikipedia_clickstream"
                    target="_blank"
                    rel="noreferrer"
                >
                    Wikipedia clickstream data
                </a>
                ↗ from October 2022, which contains the frequency of user clicks from one Wikipedia article (the source)
                to another (the target) in the month of 2022-10. The dumps are located{" "}
                <a href="https://dumps.wikimedia.org/other/clickstream/" target="_blank" rel="noreferrer">
                    here
                </a>
                ↗. I loaded this data into a{" "}
                <a href="https://neo4j.com/" target="_blank" rel="noreferrer">
                    Neo4j graph database
                </a>
                ↗, creating a node for each article in the dataset and a directed edge between each source-target pair*
                with the value of the edge being the number of clicks from the source to the target.
            </p>
            <p>
                In the visualization, each node represents a Wikipedia article in the dataset and each edge represents a
                clickstream link between the source and target articles. For example, the default graph demonstrates
                that users click from <em>Science</em> → <em>Universe</em>, and also from <em>Universe</em> →{" "}
                <em>Ultimate fate of the universe</em>. Users click both from <em>Universe</em> →{" "}
                <em>Observable universe</em> and from <em>Observable universe</em> → <em>Universe</em>.
            </p>
            <p>
                The weight of an edge in the visualization depends on the number of clicks between the source and
                target: more clicks means a thicker edge. Thus, users clicked more from <em>Universe</em> →{" "}
                <em>Big Bang</em> than from <em>Universe</em> → <em>Planet</em>.
            </p>
            <p>
                The size of a node depends on the total number of clicks into that article. Thus, the article that was
                most clicked-into in the default graph is <em>Ultimate fate of the universe</em>, and the article that
                was least clicked-into is <em>Time</em>.
            </p>
            <hr />
            <span style={{ fontSize: "0.85em" }}>
                *In order to host the database for the low, low price of Free.99 using{" "}
                <a href="https://neo4j.com/cloud/platform/aura-graph-database/" target="_blank" rel="noreferrer">
                    Neo4j AuraDB
                </a>
                ↗, I had to trim the dataset to under 200k nodes and 400k edges (the original dataset had ~3mil nodes
                and ~20mil edges). So, I first deleted all edges with fewer than 750 clicks, then removed any nodes that
                lacked any edges to other nodes as a result of the deletion, and finally deleted any nodes with fewer
                than 2 source articles linked into them.
            </span>
            {/* Build */}
            <h2>Development</h2>
            <p>
                As mentioned above, I loaded the data into a Neo4j database and hosted it using a{" "}
                <a href="https://neo4j.com/cloud/platform/aura-graph-database/" target="_blank" rel="noreferrer">
                    Neo4j AuraDB
                </a>
                ↗ instance. The visualization was created with{" "}
                <a href="https://github.com/neo4j-contrib/neovis.js?" target="_blank" rel="noreferrer">
                    neovis.js
                </a>
                ↗, a wrapper for vis.js that connects directly to a Neo4j instance. I bootstrapped this site with{" "}
                <code>create-react-app</code>, and deployed it using{" "}
                <a href="https://www.netlify.com/" target="_blank" rel="noreferrer">
                    Netlify
                </a>
                ↗.
            </p>
            {/* Source */}
            <h2>Source</h2>
            <p>
                The source code is on{" "}
                <a href="https://github.com/lee-janice/wikigraph" target="_blank" rel="noreferrer">
                    Github
                </a>
                ↗—feel free to open an issue if you have any suggestions for improvement! Any feedback would be
                extremely appreciated (on coding style too—my React is probably garbanzo beans!).
            </p>
        </div>
    );
};

export default About;
