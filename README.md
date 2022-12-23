# WikiGraph

A non-linear, graph-based approach to exploring the depths of Wikipedia

![Screenshot 2022-12-14 at 00-33-42 WikiGraph](https://user-images.githubusercontent.com/43253634/207545984-ca9613a5-865c-400b-9be3-e5c20dc9481e.png)

## Component structure

```
Index
└── App
    ├── Wikigraph
    |   ├── Canvas
    |   |   └── Graph visualization
    |   |   └── Expand visualization button
    |   |   └── *Mobile context menu button*
    |   |   └── Stabilize button
    |   |   └── Center button
    |   |   └── *Context menu*
    |   └── Sidebar
    |       └── Home tab
    |       └── About tab
    |       └── User manual tab
    └── Theme toggler
```

## TODOs

### Low-lift adjustments

-   [x] Add how-to-use tab on sidebar
-   [x] Add info tab on sidebar
-   [x] Move "Update graph with selection" option to context menu
-   [x] Add ability to full-screen the visualization
-   [x] Add dark mode
-   [x] Recenter visualization when graph rerenders
-   [x] Fix formatting on mobile
-   [x] Add alternative to context menu on mobile
-   [x] Add link to Wikipedia page on the summaries
-   [x] Allow user to double click node to expand the links
-   [x] Allow user to add nodes to existing graph
-   [ ] Delete all unconnected nodes
-   [ ] Indicate when there are no nodes in the expansion when the user double-clicks a node (vs. it just taking a long time to render)
-   [ ] Adjust it so that newly spawned nodes spawn near the clicked nodes
-   [ ] Add filters for nodes: keep only incoming nodes, keep only outgoing nodes, keep nodes above a certain size, keep links above a certain size, keep top `n` nodes, etc.
-   [ ] Add keep selected nodes to context menu
-   [ ] Notify user when article is not found in the database
-   [ ] Maybe change the color of in-going and out-going links when selecting a node? Have to think about case where two connected nodes are selected; maybe only allows this when one node is selected

#### Clean up code

-   [ ] Refactor component/file structure
-   [ ] Use styled components instead of css file for one-offs

### Longer-term modifications

-   [ ] Make the physics not so wonky and prone to flying off the screen; something like Neo4j Browser
-   [ ] holy crap the performance for expanding a node is awful
-   [ ] Implement cache for summaries and links
-   [ ] Add something like Elastic Search to Wikipedia articles
-   [ ] Allow user to save/export and load graphs
-   [ ] Allow user to click and drag to select all nodes inside an area

## Build

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and deployed with [Netlify](https://www.netlify.com/). The visualization was created with [neovis.js](https://github.com/neo4j-contrib/neovis.js).
