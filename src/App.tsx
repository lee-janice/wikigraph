import React from 'react';
import './styles/App.css';
import WikiGraph from './components/wikigraph';
import Layout from './components/layout';
import Sidebar from './components/sidebar';

const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

function App() {
    return (
		<Layout>
		<header>
			<h1>WikiGraph</h1>
			<p className='subtitle'>A graph-based approach to exploring the depths of Wikipedia</p>
		</header>
		<div className="App">
			{/* graph visualization */}
			<WikiGraph
				width={900}
				height={600}
				containerId={"viz"}
				serverDatabase={NEO4J_DB}
				serverURI={NEO4J_URI}
				serverUser={NEO4J_USER}
				serverPassword={NEO4J_PASSWORD}
			/>
			{/* sidebar  */}
			<Sidebar></Sidebar>
		</div>
		</Layout>
    )
}

export default App;
