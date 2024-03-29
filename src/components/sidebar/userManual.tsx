import React from "react";

const UserManual: React.FC = () => {
    return (
        <div className="sidebar-content">
            {/* Introduction */}
            <h1>User manual</h1>
            <p>
                Here's a (hopefully) helpful manual on how to use this tool! If you haven't familiarized yourself with
                what the nodes and edges represent in the visualization, read the Data section in the About tab.
            </p>
            <h2>
                Example: Default graph of <em>Universe</em>
            </h2>
            The default graph is a visualization of the Wikipedia article <em>Universe</em> and all of the articles that
            are linked to it in the Wikipedia clickstream data (that survived the trimming process described in the Data
            section). We can see from the graph that users click <strong>from</strong> <em>Universe</em>{" "}
            <strong>into</strong>:
            <ul>
                <li>
                    <em>Ultimate fate of the universe</em>,
                </li>
                <li>
                    <em>Time</em>,
                </li>
                <li>
                    <em>Observable universe</em>,
                </li>
                <li>
                    <em>Dark Energy</em>,
                </li>
                <li>
                    <em>Space</em>,
                </li>
                <li>
                    <em>Shape of the universe</em>,
                </li>
                <li>
                    <em>Big Bang</em>,
                </li>
                <li>
                    <em>Galaxy</em>,
                </li>
                <li>
                    <em>Planet</em>,
                </li>
                <li>
                    <em>Multiverse</em>,
                </li>
                <li>
                    <em>Chronology of the universe</em>, and
                </li>
                <li>
                    <em>Dark matter</em>,
                </li>
            </ul>
            and <strong>into</strong> <em>Universe</em> <strong>from</strong>:
            <ul>
                <li>
                    <em>Observable universe</em>,
                </li>
                <li>
                    <em>Infinity</em>, and
                </li>
                <li>
                    <em>Science</em>.
                </li>
            </ul>
            <p>
                The weight of the edges corresponds to the number of clicks from the source to the target; so of the
                displayed links, users clicked the most from the article <em>Universe</em> into the article{" "}
                <em>Big Bang</em>.
            </p>
            <p>
                The size of the node corresponds to the total number of clicks into that article; so of the displayed
                nodes, users clicked most frequently into <em>Science</em>.
            </p>
            {/* Interacting with the graph */}
            <h2>Interacting with the graph</h2>
            <h3>Adding nodes to the graph</h3>
            You can expand a node by <strong>double-clicking on it</strong>. The graph will update with all of the nodes
            linked to that node in the database.
            <h3>Changing the display of the graph</h3>
            You can change the display of the graph in a variety of ways:
            <ul>
                <li>
                    <strong>To adjust the viewport:</strong> click and drag on the background of the visualization.
                </li>
                <li>
                    <strong>To zoom in and out:</strong> scroll or pinch the visualization.
                </li>
                <li>
                    <strong>To stabilize (freeze) and center the graph:</strong> press the <em>Stabilize</em> button.
                    This is useful for when the graph's motion fails to halt after a reasonable period of time.
                </li>
                <li>
                    <strong>To fit the graph to the viewport:</strong> press the <em>Center</em> button.
                </li>
                <li>
                    <strong>You can click-and-drag a node;</strong> however, it will float into a position determined by
                    the physics algorithm in vis.js. Thus, you can only drag a node into the general vicinity that you
                    wish it to be in. <em>C'est la vie!</em>
                </li>
            </ul>
            <h3>Selecting nodes in the graph</h3>
            You can also select nodes in the graph:
            <ul>
                <li>
                    <strong>To select a singular node:</strong> left-click on the node.
                </li>
                <li>
                    <strong>To select multiple nodes:</strong> command-click or long-press on the nodes you want to
                    select.
                </li>
            </ul>
            The selected nodes are bolded and outlined in the visualization.
            {/* Context menu */}
            <h2>Context menu</h2>
            <p>
                For now, most of the interaction with the application is accomplished through right-clicking on the
                visualization. This action opens up the context menu*, which lists different options based on what was
                underneath the cursor and what was selected on the visualization (i.e., its <em>context</em>). There are
                currently three contexts: <code>Node</code>, <code>Nodes</code>, and <code>Canvas</code>.
            </p>
            <h3>
                <code>Node</code>
            </h3>
            This context is activated when there is a node underneath the cursor and a single node is selected. The
            context menu provides the user with a couple of different options:
            <ul>
                <li>
                    <strong>Load summary from Wikipedia:</strong> this option fetches the extract of the article from
                    Wikipedia and displays it in the Wikipedia Summaries section of the Home tab.
                </li>
                <li>
                    <strong>Create new graph with selection:</strong> this option renders a new graph containing the
                    selected node, all of the nodes that are connected to it, and the edges connecting the nodes.
                </li>
                <li>
                    <strong>Keep selected node:</strong> this option removes all nodes except the selected node from the
                    graph.
                </li>
                <li>
                    <strong>Expand node links:</strong> this option has the same function as double-clicking the node—it
                    will update the graph with all of the nodes linked to the selected node in the database. This option
                    is necessary for mobile interfaces, since double-clicks are not registered on mobile.
                </li>
                <li>
                    <strong>Delete node:</strong> this option deletes the selected node from the graph.
                </li>
                <li>
                    <strong>Launch Wikipedia page:</strong> this option opens the Wikipedia page for the article in a
                    new browser tab.
                </li>
            </ul>
            <h3>
                <code>Nodes</code>
            </h3>
            This context is activated when there is a node underneath the cursor and <em>multiple</em> nodes are
            selected. The options in this menu are mostly identical to the ones for <code>Node</code>, except they apply
            to all selected nodes rather than a singular node.
            <br />
            <br />
            There is one exception, which is occurs when you select <strong>two</strong> nodes. This context unlocks a
            new option, which is
            <ul>
                <li>
                    <strong>Find path between nodes:</strong> this option finds and displays the shortest path between
                    the two selected nodes, if it exists.
                </li>
            </ul>
            <h3>
                <code>Canvas</code>
            </h3>
            This context is activated when there is no node underneath the cursor, i.e., when the canvas is selected. It
            currently has only one option, which is to <strong>Open image in new tab</strong>. This option opens an
            image of the rendered graph in a new tab so that you can export it.
            <hr />
            <span style={{ fontSize: "0.85em" }}>
                *On mobile, you can open up the context menu by clicking the options button (three vertical dots) on the
                top right of the visualization.
            </span>
            {/* Search bar */}
            <h2>Search bar</h2>
            <p>
                You can search for a Wikipedia article and render its graph using the search bar. The search is case
                insensitive and uses a fuzzy match, so it'll update the graph with the closest match to your search
                query. There are two options, which are:
                <ul>
                    <li>
                        <strong>Create new graph:</strong> this option creates a new graph using your search. If no
                        match is found, there will be no graph rendered and the visualization will be blank.
                    </li>
                    <li>
                        <strong>Add to graph:</strong> this option adds the searched node to your current graph. If no
                        node is found, no nodes will be added to the graph.
                    </li>
                </ul>
            </p>
        </div>
    );
};

export default UserManual;
