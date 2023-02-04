import React from "react";
import { VisNetwork } from "../../api/vis/vis";

interface Props {
    visNetwork: VisNetwork | null;
}

const CenterButton: React.FC<Props> = React.memo(({ visNetwork }) => {
    return <input type="submit" value="Center" id="center-button" onClick={() => visNetwork?.fit()} />;
});

export default CenterButton;
