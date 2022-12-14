import React from "react";

export type WikiSummary = {
    title: string,
    text: string,
    display: boolean
}

interface Props {
    summaries?: WikiSummary[],
};

// Wikipedia API functions
// TODO: probably should put into its own file
export async function searchWikipedia(searchQuery: string): Promise<{title: string, pageid: string}> {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${searchQuery}&origin=*`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();

    // if no search results returned, throw an error 
    if (json.query.search.length === 0) {
        throw Error(`No Wikipedia articles for ${searchQuery} were found.`);
    }

    // return the Page ID of the best match
    const bestMatch = json.query.search[0];
    return {title: bestMatch.title, pageid: bestMatch.pageid.toString()} ;
};

export async function getWikipediaExtract(pageid: string) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageid}&origin=*`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();
    return json.query.pages[pageid].extract;
};

export async function getWikipediaLink(pageid: string) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&inprop=url&pageids=${pageid}&origin=*`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();
    return json.query.pages[pageid].fullurl;
};


const WikipediaSummaries: React.FC<Props> = ({ summaries }) => {
    return (
        <div id="wikipedia-summaries">
            {summaries?.map((item) => {
                const title = item.title;
                const summary = item.text;
                return (
                    <div key={title}>
                        {title}<br/>
                        <p className="wikipedia-summary">{summary}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default WikipediaSummaries;