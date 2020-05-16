import DiscordModules from "../../modules/discordmodules";
import WebpackModules from "../../modules/webpackmodules";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;
const DiscordComponent = WebpackModules.getByString("className", "itemGroup");

/**
 * This holds all the items together in a group.
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {Array<object>} [props.children] - items to contain in this group
 * @param {Array<object>} [props.items] - alias for `children`
 * 
 * @memberof module:DiscordContextMenu
 */
class ItemGroup extends React.Component {
    render() {
        const Component = DiscordComponent ? DiscordComponent.default || DiscordComponent : null;
        return React.createElement(Component, this.props, this.props.children || this.props.items);
    }
}

export default WrapBoundary(ItemGroup);