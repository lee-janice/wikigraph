# WikiGraph

A non-linear, graph-based approach to exploring the depths of Wikipedia

![Screenshot 2022-12-14 at 00-33-42 WikiGraph](https://user-images.githubusercontent.com/43253634/207545984-ca9613a5-865c-400b-9be3-e5c20dc9481e.png)

## Component structure

```
Index
└── App
    ├── Wikigraph
    |   └── Canvas
    |       └── Graph visualization
    |       └── Expand visualization button
    |       └── *Mobile context menu button*
    |       └── Stabilize button
    |       └── Center button
    |       └── *Context menu*
    |   └── Sidebar
    |       └── Home tab
    |       └── About tab
    |       └── User manual tab
    ├── Theme toggler
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
-   [ ] Add filters for nodes: keep only incoming nodes, keep only outgoing nodes, keep nodes above a certain size, keep links above a certain size, keep top `n` nodes, etc.
-   [ ] Add keep selected nodes to context menu
-   [ ] Notify user when article is not found in the database
-   [ ] Refactor component/file structure

### Longer-term modifications

-   [ ] Make the physics not so wonky and prone to flying off the screen; something like Neo4j Browser
-   [ ] If possible, allow user to double click node to expand the links
-   [ ] If possible, allow user to add nodes to existing graph
-   [ ] Implement cache for summaries and links
-   [ ] Add something like Elastic Search to Wikipedia articles
-   [ ] Allow user to save/export and load graphs

## Build

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and deployed with [Netlify](https://www.netlify.com/). The visualization was created with [neovis.js](https://github.com/neo4j-contrib/neovis.js).
