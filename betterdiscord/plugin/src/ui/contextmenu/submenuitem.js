import DiscordModules from "../../modules/discordmodules";
import WebpackModules from "../../modules/webpackmodules";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;
const ContextMenuActions = DiscordModules.ContextMenuActions;
const DiscordComponent = WebpackModules.find(m => m.default && m.default.displayName && m.default.displayName.includes("SubMenuItem"));

/**
 * Fires when the item is clicked.
 * @param {MouseEvent} event - The event generated on click
 * @callback module:DiscordContextMenu~SubMenuItemOnClick
 */

/**
 * This creates a menu item that shows a submenu on hover.
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {string} [props.theme=currentTheme] - whether to show the submenu as light or dark
 * @param {string} [props.align="center"] - how to align the submenu: "top", "bottom", "center"
 * @param {Array<object>} [props.render] - array of items to render in the submenu
 * @param {Array<object>} [props.items] - alias of `render`
 * @param {module:DiscordContextMenu~SubMenuItemOnClick} [props.action] - function to perform on click
 * @param {module:DiscordContextMenu~SubMenuItemOnClick} [props.onClick] - function to perform on click (alias of `action`)
 * @param {boolean} [props.disabled=false] - should the item be disabled/unclickable
 * 
 * @memberof module:DiscordContextMenu
 */
class SubMenuItem extends React.Component {
    handleClick(event) {
        if (this.props.onClick) this.props.onClick(event);
        if (this.props.action) this.props.action(event);
        if (this.props.closeOnClick) ContextMenuActions.closeContextMenu();
    }
    render() {
        const Component = DiscordComponent ? DiscordComponent.default || DiscordComponent : null;
        return React.createElement(Component, Object.assign({}, this.props, {render: this.props.render || this.props.items, action: this.handleClick.bind(this)}));
    }
}

export default WrapBoundary(SubMenuItem);

// Discord's implementation for reference
// function l() {
//     let e, t = this.props,
//         n = t.label,
//         r = t.render,
//         a = t.disabled,
//         l = t.action,
//         u = t.theme,
//         _ = t.align,
//         y = this.state.open,
//         E = "function" == typeof r ? r() : r.filter(function (e) {
//             return e
//         }),
//         S = (0, i.isFragment)(E) ? E.props.children.length : E.length;
//     return 0 === S ? null : m(s.default, {
//         innerRef: this.setRef,
//         className: (0, o.default)(h.default.itemSubMenu, (e = {}, e[h.default.selected] = y, e)),
//         onClick: a ? function () {} : l,
//         onMouseEnter: a ? void 0 : this.handleMouseEnter,
//         onMouseLeave: a ? void 0 : this.handleMouseLeave
//     }, void 0, m("div", {
//         className: h.default.label
//     }, void 0, n), m(c.default, {
//         className: h.default.caret
//     }), y ? m(p.AppReferencePositionLayer, {
//         position: f.Positions.RIGHT,
//         align: _ || f.Align.CENTER,
//         autoInvert: !0,
//         nudgeAlignIntoViewport: !0,
//         spacing: 12,
//         reference: this.ref
//     }, void 0, function () {
//         return m("div", {
//             className: h.default.subMenuContext,
//             onClick: g
//         }, void 0, S > 8 ? m(d.default, {
//             className: (0, o.default)(h.default.contextMenu, h.default.scroller),
//             theme: d.default.Themes.GHOST_HAIRLINE,
//             backgroundColor: u === v.ThemeTypes.LIGHT ? v.Colors.WHITE : v.Colors.PRIMARY_DARK_800
//         }, void 0, E) : m("div", {
//             className: h.default.contextMenu
//         }, void 0, E))
//     }) : null)
// }