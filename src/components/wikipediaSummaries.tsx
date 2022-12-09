import React from "react";
import { WikiSummary } from "./wikigraph";

interface Props {
    summaries?: WikiSummary[],
};

const WikipediaSummaries: React.FC<Props> = ({ summaries }) => {
    // const zipped: Array<Array<string>> = titles.map((t, i) => {
    //     return [t, summaries[i]];
    // });
    // console.log(titles)
    // console.log(summaries)
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