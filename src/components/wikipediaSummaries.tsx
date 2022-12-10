import React from "react";

export type WikiSummary = {
    title: string,
    text: string,
    display: boolean
}

interface Props {
    summaries?: WikiSummary[],
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