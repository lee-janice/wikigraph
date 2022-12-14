import React, { Dispatch, SetStateAction } from "react";

export type WikiSummary = {
    title: string,
    text: string,
}

interface Props {
    summaries: WikiSummary[],
    setSummaries: Dispatch<SetStateAction<WikiSummary[]>>,
    currentSummary: WikiSummary | null
    setCurrentSummary: Dispatch<SetStateAction<WikiSummary | null>>,
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

const WikipediaSummaries: React.FC<Props> = ({ summaries, setSummaries, currentSummary, setCurrentSummary}) => {
    const handleCloseTab = (summary: WikiSummary, i: number) => {
        const newSummaries = summaries.filter((s) => s !== summary);
        setSummaries(newSummaries);
        if (summary === currentSummary) {
            if (summaries.length === 1) {
                setCurrentSummary(null);
            } else if (i < summaries.length-1) {
                setCurrentSummary(summaries[i+1]); 
            } else {
                setCurrentSummary(summaries[i-1]);
            }
        };
    };

    if (currentSummary) {
        return (
            <div id="wikipedia-summaries">
                <div id="wikipedia-summary-tabs"> 
                    {summaries?.map((summary, i) => {
                        return <div 
                            className={`wikipedia-summary-tab ${summary === currentSummary ? 'tab-selected' : ''}`}
                            key={summary.title} 
                            onClick={() => setCurrentSummary(summary)}> 
                                {summary.title} 
                                <div className="close-tab" onClick={(e) => {e.stopPropagation(); handleCloseTab(summary, i);}}>✕</div>
                            </div>
                    })}
                </div>
                <div className="wikipedia-summary">
                    <p style={{fontSize: "large", textAlign: "center", margin: "0px 10px 10px 10px"}}>{currentSummary.title}</p>
                    {currentSummary.text}
                </div>
            </div>
        );
    } else {
        return (<div id="wikipedia-summaries">
            <div className="wikipedia-summary"></div>
        </div>
        );
    };
};

export default WikipediaSummaries;