import React from "react";

interface Props {
    // vis: HTMLDivElement
};

class SearchBar extends React.Component<Props> {
    state = {
        input: "",
        search: ""
    }

    handleChange = (event: { target: { value: string; }; }) => {
        this.state.input = (event.target.value);
        console.log("input: ", this.state.input)
    }

    handleClick = () => {
        this.state.search = this.state.input;
        console.log("search: ", this.state.search)
    }

    render() {
        return (
            <div className="search-bar" >
                Search for a Wikipedia article:<br/>
                <input type="search" id="search" placeholder="Article title" onChange={this.handleChange}/>
                <input type="submit" value="Submit" id="reload" onClick={this.handleClick}/>
            </div>
        ); 
    }
}

export default SearchBar;