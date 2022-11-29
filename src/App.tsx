import React from 'react';
import logo from './logo.svg';
import './App.css';
import WikiGraph from './wikigraph';

const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

function App() {
    return (
		<div className="App">
			<WikiGraph
				width={700}
				height={600}
				containerId={"viz"}
				serverDatabase={NEO4J_DB}
				serverURI={NEO4J_URI}
				serverUser={NEO4J_USER}
				serverPassword={NEO4J_PASSWORD}
			/>
		</div>
    )
}

export default App;
