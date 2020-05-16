import DiscordModules from "../../modules/discordmodules";
import WebpackModules from "../../modules/webpackmodules";

import {WrapBoundary} from "../errorboundary";

const React = DiscordModules.React;
const DiscordComponent = WebpackModules.getByDisplayName("SliderMenuItem");

/**
 * Fires when the item is clicked.
 * @param {Number} value - The new value selected
 * @callback module:DiscordContextMenu~SliderMenuItemOnChange
 */

/**
 * Fires when the item is clicked.
 * @param {Number} value - The value to render
 * @returns {string} the text to show in the tooltip
 * @callback module:DiscordContextMenu~SliderMenuItemRenderValue
 */

/**
 * This creates a setting style slider inside of a menu item.
 * 
 * @param {object} props - props to pass to the react renderer
 * @param {string} props.label - label to show on the menu item
 * @param {Number} [props.defaultValue=0] - the initial value of the slider
 * @param {Number} [props.minValue=0] - the minimum value of the slider
 * @param {Number} [props.maxValue=100] - the maximum value of the slider
 * @param {module:DiscordContextMenu~SliderMenuItemOnChange} [props.onValueChange] - function to perform on a value change
 * @param {module:DiscordContextMenu~SliderMenuItemOnChange} [props.onChange] - alias of `onValueChange`
 * @param {module:DiscordContextMenu~SliderMenuItemRenderValue} [props.onValueRender] - function to call to render the value in the tooltip
 * @param {module:DiscordContextMenu~SliderMenuItemRenderValue} [props.renderValue] - alias of `onValueChange`
 * 
 * @memberof module:DiscordContextMenu
 */
class SliderMenuItem extends React.Component {
    onChange(value) {
        if (this.props.onChange) this.props.onChange(value);
        if (this.props.onValueChange) this.props.onValueChange(value);
    }
    render() {
        const onValueRender = this.props.renderValue || this.props.onValueRender || undefined;
        const Component = DiscordComponent ? DiscordComponent.default || DiscordComponent : null;
        return React.createElement(Component, Object.assign({}, this.props, {onValueChange: this.onChange.bind(this), onValueRender}));
    }
}

export default WrapBoundary(SliderMenuItem);

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
//         o = l(n(6325)),
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
//         var t = e.defaultValue,
//             n = void 0 === t ? 0 : t,
//             r = e.minValue,
//             l = void 0 === r ? 0 : r,
//             s = e.maxValue,
//             d = void 0 === s ? 100 : s,
//             c = e.onValueChange,
//             f = e.onValueRender,
//             p = e.label;
//         return u("div", {
//             className: (0, a.default)(i.default.itemSlider)
//         }, void 0, u("div", {
//             className: i.default.label
//         }, void 0, p), u(o.default, {
//             mini: !0,
//             handleSize: 16,
//             className: i.default.slider,
//             initialValue: n,
//             minValue: l,
//             maxValue: d,
//             onValueChange: c,
//             onValueRender: f
//         }))
//     };
//     s.displayName = "SliderMenuItem";
//     var d = s;
//     t.default = d
// }