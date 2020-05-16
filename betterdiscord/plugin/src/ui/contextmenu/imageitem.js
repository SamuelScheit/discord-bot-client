import DiscordModules from "../../modules/discordmodules";
import WebpackModules from "../../modules/webpackmodules";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;
const ContextMenuActions = DiscordModules.ContextMenuActions;
const DiscordComponent = WebpackModules.getByDisplayName("ImageMenuItem");

/**
 * Fires when the item is clicked.
 * @param {boolean} value - The new value of `active`
 * @callback module:DiscordContextMenu~ImageMenuItemOnClick
 */

/**
 * This creates a menu item with an image or custom icon on the side.
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {string} [props.hint] - hint to show on the right hand side (usually keyboard combo)
 * @param {string} [props.image] - link to image to show on the side
 * @param {function} [props.icon] - react component to render on the side
 * @param {module:DiscordContextMenu~ImageMenuItemOnClick} [props.action] - function to perform on click
 * @param {module:DiscordContextMenu~ImageMenuItemOnClick} [props.onClick] - function to perform on click (alias of `action`)
 * @param {boolean} [props.closeOnClick=false] - should the context menu close after clicing this item
 * @param {boolean} [props.danger=false] - should the item show as danger (red)
 * @param {boolean} [props.active=false] - if this "on" can be used to make custom toggles using icons
 * @param {boolean} [props.disabled=false] - should the item be disabled/unclickable
 * 
 * @memberof module:DiscordContextMenu
 */
class ImageMenuItem extends React.Component {
    handleClick() {
        this.props.active = !this.props.active;
        if (this.props.onClick) this.props.onClick(this.props.active);
        if (this.props.action) this.props.action(this.props.active);
        if (this.props.closeOnClick) ContextMenuActions.closeContextMenu();
        this.forceUpdate();
    }
    render() {
        const Component = DiscordComponent ? DiscordComponent.default || DiscordComponent : null;
        return React.createElement(Component, Object.assign({}, this.props, {action: this.handleClick.bind(this)}));
    }
}

export default WrapBoundary(ImageMenuItem);

// Discord's implementation for reference
// function (e, t, n) {
//     "use strict";
//     t.__esModule = !0, t.default = void 0;
//     ! function (e) {
//         if (e && e.__esModule) return e;
//         var t = {};
//         if (null != e)
//             for (var n in e)
//                 if (Object.prototype.hasOwnProperty.call(e, n)) {
//                     var r = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(e, n) : {};
//                     r.get || r.set ? Object.defineProperty(t, n, r) : t[n] = e[n]
//                 } t.default = e
//     }(n(0));
//     var r, a = l(n(9)),
//         o = l(n(197)),
//         i = l(n(1024));

//     function l(e) {
//         return e && e.__esModule ? e : {
//             default: e
//         }
//     }

//     function u(e, t, n, a) {
//         r || (r = "function" == typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103);
//         var o = e && e.defaultProps,
//             i = arguments.length - 3;
//         if (t || 0 === i || (t = {
//                 children: void 0
//             }), t && o)
//             for (var l in o) void 0 === t[l] && (t[l] = o[l]);
//         else t || (t = o || {});
//         if (1 === i) t.children = a;
//         else if (i > 1) {
//             for (var u = new Array(i), s = 0; s < i; s++) u[s] = arguments[s + 3];
//             t.children = u
//         }
//         return {
//             $$typeof: r,
//             type: e,
//             key: void 0 === n ? null : "" + n,
//             ref: null,
//             props: t,
//             _owner: null
//         }
//     }
//     var s = function (e) {
//         var t, n, r = e.image,
//             l = e.icon,
//             s = e.label,
//             d = e.action,
//             c = e.active,
//             f = void 0 !== c && c,
//             p = e.disabled,
//             v = void 0 !== p && p,
//             h = e.danger,
//             _ = void 0 !== h && h;
//         return v || (n = function (e) {
//             return d(e, s, f)
//         }), u(o.default, {
//             className: (0, a.default)(i.default.item, i.default.itemImage, (t = {}, t[i.default.clickable] = !v, t[i.default.disabled] = v, t[i.default.danger] = _, t)),
//             onClick: n
//         }, void 0, u("div", {
//             className: i.default.label
//         }, void 0, s), null != r ? u("img", {
//             alt: "",
//             src: r,
//             className: i.default.image
//         }) : null, null != l ? u(l, {
//             className: i.default.image
//         }) : null)
//     };
//     s.displayName = "ImageMenuItem";
//     var d = s;
//     t.default = d