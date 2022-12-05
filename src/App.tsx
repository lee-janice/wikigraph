import './styles/App.css';
import WikiGraph from './components/wikigraph';
import Layout from './components/layout';
import { RefObject, useEffect, useRef, useState } from 'react';
import CurrentNodes from './components/currentNodes';
import SearchBar from './components/searchbar';

const NEO4J_DB = String(process.env.REACT_APP_NEO4J_DB);
const NEO4J_URI = String(process.env.REACT_APP_NEO4J_URI);
const NEO4J_USER = String(process.env.REACT_APP_NEO4J_USER);
const NEO4J_PASSWORD = String(process.env.REACT_APP_NEO4J_PASSWORD);

function App() {
	// keep track of search bar input
	const [input, setInput] = useState("");
	const [search, setSearch] = useState("Universe");

	const handleChange = (event: { target: { value: string; }; }) => {
		setInput(event.target.value);
    }

    const handleClick = () => {
		setSearch(input);
    }

	// keep track of wikigraph reference
	const visRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		console.log("search: ", search)
		// visRef.current
		// visRef?.current?.handleSearch(search);
	}, [search]);

    return (
		<Layout>
			<header>
				<h1>WikiGraph</h1>
				<p className='subtitle'>A graph-based approach to exploring the depths of Wikipedia</p>
			</header>
			<div className="App">
				{/* graph visualization */}
				<WikiGraph
					ref={visRef}
					width={900}
					height={600}
					containerId={"vis"}
					serverDatabase={NEO4J_DB}
					serverURI={NEO4J_URI}
					serverUser={NEO4J_USER}
					serverPassword={NEO4J_PASSWORD}
					search={search}
				/>
				{/* sidebar  */}
				<div className="sidebar">
					<CurrentNodes/>
					<div className="search-bar">
						Search for a Wikipedia article:<br/>
						<input type="search" id="search" placeholder="Article title" onChange={handleChange}/>
						<input type="submit" value="Submit" id="reload" onClick={handleClick}/>
					</div>
				</div>
			</div>
		</Layout>
    )
}

export default App;
