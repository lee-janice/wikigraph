import React, { Dispatch, SetStateAction } from "react";

export type WikiSummary = {
    title: string;
    text: string;
};

interface Props {
    summaries: WikiSummary[];
    setSummaries: Dispatch<SetStateAction<WikiSummary[]>>;
    currentSummary: WikiSummary | null;
    setCurrentSummary: Dispatch<SetStateAction<WikiSummary | null>>;
}

const WikipediaSummaries: React.FC<Props> = ({ summaries, setSummaries, currentSummary, setCurrentSummary }) => {
    const handleCloseTab = (summary: WikiSummary, i: number) => {
        const newSummaries = summaries.filter((s) => s !== summary);
        setSummaries(newSummaries);
        if (summary === currentSummary) {
            if (summaries.length === 1) {
                setCurrentSummary(null);
            } else if (i < summaries.length - 1) {
                setCurrentSummary(summaries[i + 1]);
            } else {
                setCurrentSummary(summaries[i - 1]);
            }
        }
    };

    if (currentSummary) {
        return (
            <div id="wikipedia-summaries">
                <div id="wikipedia-summary-tabs">
                    {summaries?.map((summary, i) => {
                        return (
                            <div
                                className={`wikipedia-summary-tab ${summary === currentSummary ? "tab-selected" : ""}`}
                                key={summary.title}
                                onClick={() => setCurrentSummary(summary)}
                            >
                                {summary.title}
                                <div
                                    className="close-tab"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseTab(summary, i);
                                    }}
                                >
                                    ✕
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="wikipedia-summary">
                    <h1>{currentSummary.title}</h1>
                    {/* // TODO: need to escape math elements: e.g. in the "Dark energy" summary */}
                    {currentSummary.text.split("\n").map((text, i) => {
                        return (
                            <p key={i} style={{ whiteSpace: "pre-line" }}>
                                {text}
                            </p>
                        );
                    })}
                </div>
            </div>
        );
    } else {
        return (
            <div id="wikipedia-summaries">
                <div id="wikipedia-summary-tabs"></div>
                <div className="wikipedia-summary">
                    <h1>Wikipedia summaries</h1>
                    Article summaries from Wikipedia will appear here. To generate a summary, right-click a node in the
                    graph to open the context menu, and click <em>Load summary from Wikipedia</em>. (To open the context
                    menu on mobile, click the options button in the top right of the visualization.)
                </div>
            </div>
        );
    }
};

export default WikipediaSummaries;
