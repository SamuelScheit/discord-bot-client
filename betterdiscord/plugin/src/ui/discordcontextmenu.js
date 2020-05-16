import DiscordModules from "../modules/discordmodules";
import WebpackModules from "../modules/webpackmodules";
import ReactTools from "../modules/reacttools";
import Patcher from "../modules/patcher";
import Utilities from "../modules/utilities";
import DiscordSelectors from "../modules/discordselectors";

import ContextMenu from "./contextmenu/contextmenu";

import ItemGroup from "./contextmenu/itemgroup";

import MenuItem from "./contextmenu/menuitem";
import ImageMenuItem from "./contextmenu/imageitem";
import ToggleMenuItem from "./contextmenu/toggleitem";
import SubMenuItem from "./contextmenu/submenuitem";
import SliderMenuItem from "./contextmenu/slideritem";

const React = DiscordModules.React;
const ContextMenuActions = DiscordModules.ContextMenuActions;

const ce = React.createElement;

/**
 * A utility for building and rendering Discord's own menus.
 * @module DiscordContextMenu
 * @version 0.0.1
 */
export default class DiscordContextMenu {

    static get ContextMenu() {return ContextMenu;}
    static get ItemGroup() {return ItemGroup;}
    static get MenuItem() {return MenuItem;}
    static get ToggleMenuItem() {return ToggleMenuItem;}
    static get SubMenuItem() {return SubMenuItem;}
    static get ImageMenuItem() {return ImageMenuItem;}
    static get SliderMenuItem() {return SliderMenuItem;}

    /**
     * Builds a single menu item. The only prop shown here is the type, the rest should
     * match the actual component being built. View those to see what options exist
     * for each, they often have less in common than you might think. See {@link module:DiscordContextMenu.MenuItem}
     * for the majority of props commonly available. Check the documentation for the
     * rest of the components.
     * 
     * @param {object} props - props used to build the item
     * @param {string} [props.type="text"] - type of the item, options: text, image, submenu, toggle, slider
     * @returns {object} the created component
     * 
     * @see {@link module:DiscordContextMenu.MenuItem}
     * @see {@link module:DiscordContextMenu.ToggleMenuItem}
     * @see {@link module:DiscordContextMenu.SubMenuItem}
     * @see {@link module:DiscordContextMenu.ImageMenuItem}
     * @see {@link module:DiscordContextMenu.SliderMenuItem}
     * 
     * @example
     * // Creates a single menu item that prints "MENU ITEM" on click
     * DiscordContextMenu.buildMenuItem({
     *      label: "Menu Item",
     *      action: () => {console.log("MENU ITEM");}
     * });
     * 
     * @example
     * // Creates a single toggle item that starts unchecked
     * // and print the new value on every toggle
     * DiscordContextMenu.buildMenuItem({
     *      type: "toggle",
     *      label: "Item Toggle",
     *      active: false,
     *      action: (newValue) => {console.log(newValue);}
     * });
     */
    static buildMenuItem(props) {
        const {type} = props;
        let Component = MenuItem;
        if (type === "image") {
            Component = ImageMenuItem;
        }
        else if (type === "submenu") {
            Component = SubMenuItem;
            if (!props.render) props.render = this.buildMenuChildren(props.render || props.items);
        }
        else if (type === "toggle") {
            Component = ToggleMenuItem;
        }
        else if (type === "slider") {
            Component = SliderMenuItem;
        }
        return ce(Component, props);
    }

    /**
     * Creates the all the items **and groups** of a context menu recursively.
     * There is no hard limit to the number of groups within groups or number
     * of items in a menu.
     * @param {Array<object>} setup - array of item props used to build items. See {@link module:DiscordContextMenu.buildMenuItem}
     * @returns {Array<object>} array of the created component
     * 
     * @example
     * // Creates a single item group item with a toggle item
     * DiscordContextMenu.buildMenuChildren([{
     *      type: "group",
     *      items: [{
     *          type: "toggle",
     *          label: "Item Toggle",
     *          active: false,
     *          action: (newValue) => {console.log(newValue);}
     *      }]
     * }]);
     * 
     * @example
     * // Creates two item groups with a single toggle item each
     * DiscordContextMenu.buildMenuChildren([{
     *     type: "group",
     *     items: [{
     *         type: "toggle",
     *         label: "Item Toggle",
     *         active: false,
     *         action: (newValue) => {
     *             console.log(newValue);
     *         }
     *     }]
     * }, {
     *     type: "group",
     *     items: [{
     *         type: "toggle",
     *         label: "Item Toggle",
     *         active: false,
     *         action: (newValue) => {
     *             console.log(newValue);
     *         }
     *     }]
     * }]);
     */
    static buildMenuChildren(setup) {
        const mapper = s => {
            if (s.type === "group") return buildGroup(s);
            return this.buildMenuItem(s);
        };
        const buildGroup = function(group) {
            const items = group.items.map(mapper).filter(i => i);
            return ce(ItemGroup, null, items);
        };
        return setup.map(mapper).filter(i => i);
    }

    /**
     * Creates the menu *component* including the wrapping `ContextMenu`.
     * Calls {@link module:DiscordContextMenu.buildMenuChildren} under the covers.
     * Used to call in combination with {@link module:DiscordContextMenu.openContextMenu}.
     * @param {Array<object>} setup - array of item props used to build items. See {@link module:DiscordContextMenu.buildMenuChildren}
     * @returns {function} the unique context menu component
     */
    static buildMenu(setup) {
        return (props) => {return ce(ContextMenu, props, this.buildMenuChildren(setup));};
    }

    /**
     * 
     * @param {MouseEvent} event - The context menu event. This can be emulated, requires target, and all X, Y locations.
     * @param {function} menuComponent - Component to render. This can be any react component or output of {@link module:DiscordContextMenu.buildMenu}
     * @param {object} config - configuration/props for the context menu
     * @param {string} [config.position="right"] - default position for the menu, options: "left", "right"
     * @param {string} [config.align="top"] - default alignment for the menu, options: "bottom", "top"
     * @param {function} [config.onClose] - function to run when the menu is closed
     * @param {boolean} [config.noBlurEvent=false] - No clue
     */
    static openContextMenu(event, menuComponent, config) {
        return ContextMenuActions.openContextMenu(event, function(e) {
            return ce(menuComponent, e);
        }, config);
    }

    /**
     * Attempts to find and return a specific context menu type's module. Useful
     * when patching the render of these menus.
     * @param {string} type - name of the context menu type
     * @returns {Promise<object>} the webpack module the menu was found in
     */
    static async getDiscordMenu(type) {
        return new Promise(resolve => {
            const cancel = Patcher.after("ZeresLibrary.DiscordContextMenu", ContextMenuActions, "openContextMenu", (_, [, component]) => {
                const rendered = component();
                const menuType = rendered.props && rendered.props.type || (rendered.type && rendered.type.displayName);
                if (!menuType || typeof(menuType) != "string" || !menuType.includes(type)) return;
                cancel();
                return resolve(WebpackModules.getModule(m => m.default == rendered.type));
            });
        });
    }

    /**
     * Calls `forceUpdate()` on all context menus it can find. Useful for
     * after patching a menu.
     */
    static forceUpdateMenus() {
        const menus = document.querySelectorAll(DiscordSelectors.ContextMenu.contextMenu);
        for (const menu of menus) {
            const stateNode = Utilities.findInTree(ReactTools.getReactInstance(menu), m=>m && m.forceUpdate && m.updatePosition, {walkable: ["return", "stateNode"]});
            if (!stateNode) continue;
            stateNode.forceUpdate();
            stateNode.updatePosition();
        }
    }
}