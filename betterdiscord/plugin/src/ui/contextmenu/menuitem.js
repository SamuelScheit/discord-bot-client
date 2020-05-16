import DiscordModules from "../../modules/discordmodules";
import WebpackModules from "../../modules/webpackmodules";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;
const ContextMenuActions = DiscordModules.ContextMenuActions;
const DiscordComponent = WebpackModules.getByRegex(/\.label\b.*\.hint\b.*\.action\b/);

/**
 * Fires when the item is clicked.
 * @param {MouseEvent} event - event object invoked on click
 * @callback module:DiscordContextMenu~MenuItemOnClick
 */

/**
 * This creates a basic menu item with a lot of options.
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {string} [props.hint] - hint to show on the right hand side (usually keyboard combo)
 * @param {string} [props.className] - additional class name for this item
 * @param {string} [props.tooltip] - text to show on hover
 * @param {Array<object>} [props.children] - array of children to render underneath
 * @param {module:DiscordContextMenu~MenuItemOnClick} [props.action] - function to perform on click
 * @param {module:DiscordContextMenu~MenuItemOnClick} [props.onClick] - function to perform on click (alias of `action`)
 * @param {boolean} [props.closeOnClick=false] - should the context menu close after clicing this item
 * @param {boolean} [props.danger=false] - should the item show as danger (red)
 * @param {boolean} [props.brand=false] - should the item be blurple (branded)
 * @param {boolean} [props.disabled=false] - should the item be disabled/unclickable
 * 
 * @memberof module:DiscordContextMenu
 */
class MenuItem extends React.Component {
    handleClick(event) {
        if (this.props.onClick) this.props.onClick(event);
        if (this.props.action) this.props.action(event);
        if (this.props.closeOnClick) ContextMenuActions.closeContextMenu();
    }
    render() {
        const Component = DiscordComponent ? DiscordComponent.default || DiscordComponent : null;
        return React.createElement(Component, Object.assign({}, this.props, {action: this.handleClick.bind(this)}));
    }
}

export default WrapBoundary(MenuItem);

// Discord's implementation for reference
// var c = function (e) {
//     var t, n = e.style,
//         r = e.label,
//         s = e.hint,
//         c = e.action,
//         f = e.danger,
//         p = void 0 !== f && f,
//         v = e.disabled,
//         h = void 0 !== v && v,
//         _ = e.brand,
//         m = void 0 !== _ && _,
//         y = e.children,
//         g = e.className,
//         E = e.tooltip,
//         S = d(i.default, {
//             className: (0, o.default)(u.default.item, (t = {}, t[u.default.clickable] = !h, t[u.default.danger] = p, t[u.default.disabled] = h, t[u.default.brand] = m, t), g),
//             style: n,
//             role: "menuitem",
//             onClick: h ? void 0 : c
//         }, void 0, d("div", {
//             className: u.default.label
//         }, void 0, r), d("div", {
//             className: u.default.hint
//         }, void 0, s), y);
//     return null != E ? d(l.default, {
//         text: E
//     }, void 0, function (e) {
//         return a.createElement("div", e, S)
//     }) : S
// };
// t.default = c