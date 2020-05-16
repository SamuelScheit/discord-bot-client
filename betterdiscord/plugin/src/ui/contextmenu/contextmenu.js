import DiscordModules from "../../modules/discordmodules";
import DiscordClasses from "../../modules/discordclasses";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;

/**
 * This creates the main context menu
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {Array<object>} props.children - items and groups to show
 * 
 * @memberof module:DiscordContextMenu
 */
class ContextMenu extends React.Component {

    static get defaultProps() {
        return {
            className: DiscordClasses.ContextMenu.contextMenu,
            config: {},
            position: "right",
            align: "top",
            theme: "dark"
        };
    }
    
    render() {
        return React.createElement("div", Object.assign({}, ContextMenu.defaultProps, this.props));
    }
}

export default WrapBoundary(ContextMenu);