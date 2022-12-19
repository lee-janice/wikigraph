// ----- Wikipedia API functions -----
export async function searchWikipedia(searchQuery: string): Promise<{ title: string; pageid: number }> {
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
    return { title: bestMatch.title, pageid: bestMatch.pageid };
}

export async function getWikipediaExtract(pageid: number) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&pageids=${pageid}&origin=*`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();
    return json.query.pages[pageid].extract;
}

export async function getWikipediaLink(pageid: number) {
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=info&inprop=url&pageids=${pageid}&origin=*`;

    const response = await fetch(endpoint);
    // if request failed, throw an error
    if (!response.ok) {
        throw Error(response.statusText);
    }
    const json = await response.json();
    return json.query.pages[pageid].fullurl;
}
