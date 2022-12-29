import styled from "styled-components";

const StyledAlert = styled.div`
    ${(props) => (props.theme.show ? "" : "display: none;")}
    position: absolute;
    margin: 10px 10px;
    right: 0px;
    bottom: 0px;
    width: 300px;
    text-align: right;
    color: var(--borderColor);
`;

StyledAlert.defaultProps = {
    theme: {
        show: false,
    },
};

export enum AlertType {
    NoArticleFound,
    EndOfPath,
    None,
}

export type AlertState = {
    show: boolean;
    type: AlertType;
};

interface Props {
    state: AlertState;
}

const Alert: React.FC<Props> = ({ state }) => {
    switch (state.type) {
        case AlertType.NoArticleFound:
            return <StyledAlert theme={{ show: state.show }}>No such article was found.</StyledAlert>;
        case AlertType.EndOfPath:
            return <StyledAlert theme={{ show: state.show }}>You've reached the end of the path.</StyledAlert>;
        case AlertType.None:
            return <div></div>;
    }
};

export default Alert;
