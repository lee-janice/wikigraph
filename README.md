# WikiGraph

A non-linear, graph-based approach to exploring the depths of Wikipedia

![wikigraph](https://user-images.githubusercontent.com/43253634/209751473-3363130c-64ce-4abc-a9d9-c3a6e8abfce0.png)

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
    ├── Sidebar
    |   └── Home tab
    |   └── About tab
    |   └── User manual tab
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
-   [x] Delete all unconnected nodes
-   [x] Indicate when there are no nodes in the expansion when the user double-clicks a node (vs. it just taking a long time to render)
-   [x] Notify user when article is not found in the database
-   [x] Add keep selected nodes to context menu
-   [x] Add expand selected nodes to context menu
-   [ ] Make alert for no additional nodes more accurate—alert when there are no new nodes in the graph as a result of the query
-   [ ] Maybe change the color of in-going and out-going links when selecting a node? Have to think about case where two connected nodes are selected; maybe only allows this when one node is selected

#### Clean up code

-   [x] Refactor component/file structure
-   [ ] Use styled components instead of css file for one-offs

### Longer-term modifications

-   [x] holy crap the performance for expanding a node is awful
-   [x] Make the physics not so wonky and prone to flying off the screen; something like Neo4j Browser
-   [ ] Add filters for nodes: keep only incoming nodes, keep only outgoing nodes, keep nodes above a certain size, keep links above a certain size, keep top `n` nodes, etc.
-   [ ] Allow user to click and drag a node and make it stick
-   [ ] Add "find path between two nodes" option
-   [ ] Implement cache for summaries and links
-   [ ] Add something like Elastic Search to Wikipedia articles
-   [ ] Allow user to save/export and load graphs
-   [ ] Allow user to click and drag to select all nodes inside an area
-   [ ] Make an excerpt of the summary (first sentence) appear on hovering over a node
-   [ ] Aggregate more months of data
-   [ ] Host the whole database on a server
-   [ ] Explore possibility of using the whole Wikipedia data dump with groupings by [properties](https://www.wikidata.org/wiki/Wikidata:List_of_properties) instead of clickstream data

## Build

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and deployed with [Netlify](https://www.netlify.com/). The visualization was created with [neovis.js](https://github.com/neo4j-contrib/neovis.js).
