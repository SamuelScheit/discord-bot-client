import DiscordModules from "../../modules/discordmodules";
import WebpackModules from "../../modules/webpackmodules";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;
const DiscordComponent = WebpackModules.getByString("itemToggle", "checkbox");

/**
 * Fires when the item is clicked.
 * @param {boolean} value - The new value of `active`
 * @callback module:DiscordContextMenu~ToggleMenuItemOnClick
 */

/**
 * This creates a menu item with a checkbox toggle.
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {string} [props.className] - additional class name for the label
 * @param {object} [props.style] - css styles for the main label
 * @param {object} [props.checkboxStyle] - css styles for the checkbox
 * @param {module:DiscordContextMenu~ToggleMenuItemOnClick} [props.action] - function to perform on click
 * @param {module:DiscordContextMenu~ToggleMenuItemOnClick} [props.onClick] - function to perform on click (alias of `action`)
 * @param {boolean} [props.loading=false] - should the text show as loading... not super useful
 * @param {boolean} [props.danger=false] - should the item show as danger (red)
 * @param {boolean} [props.active=false] - should the checkbox be checked
 * @param {boolean} [props.disabled=false] - should the item be disabled/unclickable
 * 
 * @memberof module:DiscordContextMenu
 */
class ToggleMenuItem extends React.Component {
    handleToggle() {
        this.props.active = !this.props.active;
        if (this.props.action) this.props.action(this.props.active);
        this.forceUpdate();
    }
    render() {
        const Component = DiscordComponent ? DiscordComponent.default || DiscordComponent : null;
        return React.createElement(Component, Object.assign({}, this.props, {action: this.handleToggle.bind(this)}));
    }
}

export default WrapBoundary(ToggleMenuItem);

// Discord's implementation for reference
// const f = function (e) {
//     let t, n, r = e.label,
//         s = e.action,
//         f = e.active,
//         p = void 0 !== f && f,
//         v = e.disabled,
//         h = void 0 !== v && v,
//         _ = e.danger,
//         m = void 0 !== _ && _,
//         y = e.loading,
//         g = void 0 !== y && y,
//         E = e.style,
//         S = e.checkboxStyle,
//         O = e.className;
//     return h || (n = function (e) {
//         return s(e, r, p)
//     }), d(i.default, {
//         className: (0, a.default)(u.default.item, u.default.itemToggle, O, (t = {}, t[u.default.clickable] = !h, t[u.default.disabled] = h, t[u.default.danger] = m, t)),
//         onClick: n
//     }, void 0, d("div", {
//         className: u.default.label,
//         style: E
//     }, void 0, g ? d(l.default, {
//         type: l.default.Type.PULSING_ELLIPSIS
//     }) : r), d(o.default, {
//         checked: p,
//         containerClassName: u.default.checkbox,
//         onChange: c,
//         style: S
//     }))
// };