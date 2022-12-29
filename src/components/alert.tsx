import styled from "styled-components";

const StyledAlert = styled.div`
    ${(props) => (props.theme.show ? "" : "display: none;")}
    position: absolute;
    margin: 10px 10px;
    right: 0px;
    bottom: 0px;
    width: 256px;
    text-align: right;
    color: var(--borderColor);
`;

StyledAlert.defaultProps = {
    theme: {
        show: false,
    },
};

export enum WikigraphAlertType {
    NoArticleFound,
    NoNewConnectionsFound,
    None,
}

export type WikigraphAlertState = {
    show: boolean;
    type: WikigraphAlertType;
};

interface Props {
    state: WikigraphAlertState;
}

const WikigraphAlert: React.FC<Props> = ({ state }) => {
    switch (state.type) {
        case WikigraphAlertType.NoArticleFound:
            return <StyledAlert theme={{ show: state.show }}>No such article was found.</StyledAlert>;
        case WikigraphAlertType.NoNewConnectionsFound:
            return <StyledAlert theme={{ show: state.show }}>No new connections were found.</StyledAlert>;
        case WikigraphAlertType.None:
            return <div></div>;
    }
};

export default WikigraphAlert;
