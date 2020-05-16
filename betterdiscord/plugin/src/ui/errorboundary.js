import DiscordModules from "../modules/discordmodules";

const React = DiscordModules.React;
const ce = React.createElement;

export default class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = {hasError: false};
    }
  
    componentDidCatch() {
      this.setState({hasError: true});
    }
  
    render() {
      if (this.state.hasError) return ce("div", {className: "error"}, "Component Error");  
      return this.props.children; 
    }
}

export function WrapBoundary(Original) {
  return class ErrorBoundaryWrapper extends React.Component {
      render() {
          return ce(ErrorBoundary, null, ce(Original, this.props));
      }
  };
}