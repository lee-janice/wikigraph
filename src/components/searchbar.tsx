import React, { Fragment, useEffect, useRef } from "react";

interface Props {};

const SearchBar: React.FC<Props> = ({}) => {
    useEffect(() => {}, []);
    return (
        <div className="search-bar">
            Search for a Wikipedia article:<br/>
            <input type="search" id="search" placeholder="Article title"/>
            <input type="submit" value="Submit" id="reload"/>
        </div>
    );
};

export default SearchBar;