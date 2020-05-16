/**
 * Self-made context menus that emulate Discord's own context menus.
 * @module ContextMenu
 * @version 0.1.0
 */

import DiscordClasses from "../modules/discordclasses";
import DiscordSelectors from "../modules/discordselectors";
import ReactTools from "../modules/reacttools";
import DiscordModules from "../modules/discordmodules";
import DOMTools from "../modules/domtools";
import Screen from "../structs/screen";

/**
 * Updates the location of a Discord menu, especially useful when adding items to the menu via DOM.
 * @param {HTMLElement|jQuery} menu - The original discord menu
 */
export function updateDiscordMenu(menu) {
    if (!(menu instanceof window.jQuery) && !(menu instanceof Element)) return;
    const updateHeight = ReactTools.getReactProperty(menu, "return.return.return.stateNode.updatePosition");
    if (updateHeight) updateHeight();
}

/** Main menu class for creating custom context menus. */
export class Menu {
    /**
     *
     * @param {boolean} [scroll=false] - should this menu be a scrolling menu (usually only used for submenus)
     */
    constructor(submenu = false, scroll = false) {
        this.theme = DiscordModules.UserSettingsStore.theme == "dark" ? "theme-dark" : "theme-light";
        this.isSubmenu = submenu;
        this.element = DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.contextMenu} plugin-context-menu ${this.theme}"></div>`);
        this.scroll = scroll;
        if (!scroll) return;
        this.scroller = DOMTools.createElement(`<div class="${DiscordClasses.Scrollers.scroller} ${DiscordClasses.ContextMenu.scroller}"></div>`);
        this.scrollerWrap = DOMTools.createElement(`<div class="${DiscordClasses.Scrollers.scrollerWrap} ${DiscordClasses.Scrollers.scrollerThemed} ${DiscordClasses.Scrollers.themeGhostHairline}"></div>`);
        this.scrollerWrap.append(this.scroller);
        this.element.append(this.scrollerWrap);
    }

    /**
     * Adds an item group to the menu. The group should already be populated.
     * @param {module:ContextMenu.ItemGroup} contextGroup - group to add to the menu
     * @returns {module:ContextMenu.Menu} returns self for chaining
     */
    addGroup(contextGroup) {
        if (this.scroll) this.scroller.append(contextGroup.getElement());
        else this.element.append(contextGroup.getElement());
        return this;
    }

    /**
     * Adds items to the context menu directly. It is recommended to add to a group and use
     * {@link module:ContextMenu.Menu.addGroup} instead to behave as natively as possible.
     * @param {module:ContextMenu.MenuItem} contextItems - list of items to add to the context menu
     * @returns {module:ContextMenu.Menu} returns self for chaining
     */
    addItems(...contextItems) {
        for (let i = 0; i < contextItems.length; i++) {
            if (this.scroll) this.scroller.append(contextItems[i].getElement());
            else this.element.append(contextItems[i].getElement());
        }
        return this;
    }

    /**
     * Shows the menu at a specific x and y position. This generally comes from the
     * pointer position on a right click event.
     * @param {number} x - x coordinate for the menu to show at
     * @param {number} y - y coordinate for the menu to show at
     */
    show(x, y) {
        const mouseX = x;
        const mouseY = y;

        const parents = this.element.closest(this.parentSelector);
        const depth = parents.length;
        // if (depth == 0) {
            const layer = DOMTools.createElement(`<div class="${DiscordClasses.TooltipLayers.layer}"></div>`);
            let elementToAdd = this.element;
            if (this.isSubmenu) {
                const submenu = DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.subMenuContext}"></div>`);
                submenu.append(this.element);
                elementToAdd = submenu;
            }
            layer.append(elementToAdd);
            layer.appendTo(DiscordSelectors.Popouts.popouts.sibling(DiscordSelectors.TooltipLayers.layerContainer).toString());
        // }
        this.element.css("top", mouseY + "px").css("left", mouseX + "px");

        if (mouseY + this.element.outerHeight() >= Screen.height) {
            this.element.addClass("invertY").addClass(DiscordClasses.ContextMenu.invertY);
            this.element.css("top", `${mouseY - this.element.outerHeight()}px`);
            if (depth > 0) this.element.css("top", `${(mouseY + this.element.parent().outerHeight()) - this.element.outerHeight()}px`);
        }
        if (this.element.offset().left + this.element.outerWidth() >= Screen.width) {
            this.element.addClass("invertX");
            this.element.css("left", `${mouseX - this.element.outerWidth()}px`);
        }
        if (this.element.offset().left + 2 * this.element.outerWidth() >= Screen.width) {
            this.element.addClass(DiscordClasses.ContextMenu.invertChildX);
        }

        if (depth !== 0) return;
        DOMTools.on(document, "mousedown.zctx", (e) => { if (!this.element.contains(e.target) && !this.element.isSameNode(e.target)) this.removeMenu(); });
        DOMTools.on(document, "click.zctx", (e) => { if (this.element.contains(e.target)) this.removeMenu(); });
        DOMTools.on(document, "keyup.zctx", (e) => { if (e.keyCode === 27) this.removeMenu(); });
    }

    /** Allows you to remove the menu. */
    removeMenu() {
        this.element.closest(DiscordSelectors.TooltipLayers.layer.toString())[0].remove();
        const childs = this.element.findAll(this.parentSelector);
        if (childs) childs.forEach(c => c.remove());
        DOMTools.off(document, ".zctx");
    }

    /**
     * Used to attach a menu to a menu item. This is how to create a submenu.
     * If using {@link module:ContextMenu.SubMenuItem} then you do not need
     * to call this function as it is done automatically. If you want to attach
     * a submenu to an existing Discord context menu, then you should use this
     * method.
     * @param {(HTMLElement|jQuery)} menuItem - item to attach to
     */
    attachTo(menuItem) {
        this.menuItem = menuItem;
        menuItem.addEventListener("mouseenter", () => {
            // this.element.appendTo(DiscordSelectors.Popouts.popouts.sibling(DiscordSelectors.TooltipLayers.layerContainer).toString());
            // const left = this.element.parents(this.parentSelector)[0].css("left");
            //console.log(parseInt(menuItem.offset().left), parseInt(menuItem.offset().top));
            this.show(parseInt(menuItem.offset().right), parseInt(menuItem.offset().top));
        });
        menuItem.addEventListener("mouseleave", () => { this.element.closest(DiscordSelectors.TooltipLayers.layer.toString())[0].remove(); });
    }

    get parentSelector() {return this.element.closest(".plugin-context-menu").length > this.element.closest(DiscordSelectors.ContextMenu.contextMenu).length ? ".plugin-context-menu" : DiscordSelectors.ContextMenu.contextMenu;}
}

/** Class that represents a group of menu items. */
export class ItemGroup {
    /** Creates an item group. */
    constructor() {
        this.element = DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.itemGroup}"></div>`);
    }

    /**
     * This is the method of adding menu items to a menu group.
     * @param {module:ContextMenu.MenuItem} contextItems - list of context menu items to add to this group
     * @returns {module:ContextMenu.ItemGroup} returns self for chaining
     */
    addItems(...contextItems) {
        for (let i = 0; i < contextItems.length; i++) {
            this.element.append(contextItems[i].getElement());
        }
        return this;
    }

    /** @returns {HTMLElement} returns the DOM node for the group */
    getElement() { return this.element; }
}

/**
 * Fires when the attached menu item it clicked.
 * @param {MouseEvent} event - the mouse event from clicking the item
 * @callback module:ContextMenu~clickEvent
 */

 /**
 * Fires when the checkbox item changes state.
 * @param {boolean} isChecked - if the checkbox is now checked
 * @callback module:ContextMenu~onChange
 */

/** Base class for all other menu items. */
export class MenuItem {
    /**
     * @param {string} label - label to show on the menu item
     * @param {object} options - additional options for the item
     * @param {boolean} [options.danger=false] - should the item show as danger
     * @param {module:ContextMenu~clickEvent} [options.callback] - callback for when it is clicked
     */
    constructor(label, options = {}) {
        const {danger = false, callback} = options;
        this.element = DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.item}"></div>`);
        this.label = label;
        if (danger) this.element.addClass(DiscordClasses.ContextMenu.danger);
        this.element.on("click", (event) => {
            if (!Array.from(this.element.children).some(c => c.isSameNode(event.target)) && !this.element.isSameNode(event.target)) return;
            if (typeof(callback) == "function") callback(event);
            else event.stopPropagation();
        });
    }
    getElement() { return this.element;}
}

/**
 * Creates a text menu item that can have a hint.
 * @extends module:ContextMenu.MenuItem
 */
export class TextItem extends MenuItem {
    /**
     * @param {string} label - label to show on the menu item
     * @param {object} options - additional options for the item
     * @param {string} [options.hint=""] - hint to show on the item (usually used for key combos)
     * @param {boolean} [options.danger=false] - should the item show as danger
     * @param {module:ContextMenu~clickEvent} [options.callback] - callback for when it is clicked
     */
    constructor(label, options = {}) {
        super(label, options);
        const {hint = ""} = options;
        this.element.append(DOMTools.createElement(`<span>${label}</span>`));
        this.element.append(DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.hint}">${hint}</div>`));
    }
}

/**
 * Creates an image menu item that can have an image.
 * @extends module:ContextMenu.MenuItem
 */
export class ImageItem extends MenuItem {
    /**
     * @param {string} label - label to show on the menu item
     * @param {string} imageSrc - link to the image to embed
     * @param {object} options - additional options for the item
     * @param {string} [options.hint=""] - hint to show on the item (usually used for key combos)
     * @param {boolean} [options.danger=false] - should the item show as danger
     * @param {module:ContextMenu~clickEvent} [options.callback] - callback for when it is clicked
     */
    constructor(label, imageSrc, options = {}) {
        super(label, options);
        this.element.addClass(DiscordClasses.ContextMenu.itemImage);
        this.element.append(DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.label}">${label}</div>`));
        this.element.append(DOMTools.createElement(`<img src="${imageSrc}">`));
    }
}

/**
 * Creates a menu item with an attached submenu.
 * @extends module:ContextMenu.MenuItem
 */
export class SubMenuItem extends MenuItem {
    /**
     * @param {string} label - label to show on the menu item
     * @param {module:ContextMenu.Menu} subMenu - context menu that should be attached to this item
     * @param {object} options - additional options for the item
     * @param {string} [options.hint=""] - hint to show on the item (usually used for key combos)
     * @param {boolean} [options.danger=false] - should the item show as danger
     * @param {module:ContextMenu~clickEvent} [options.callback] - callback for when it is clicked
     */
    constructor(label, subMenu, options = {}) {
        // if (!(subMenu instanceof ContextSubMenu)) throw "subMenu must be of ContextSubMenu type.";
        super(label, options);
        this.element.addClass(DiscordClasses.ContextMenu.itemSubMenu);
        this.element.append(DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.label}">${label}</div>`));
        this.element.append(DOMTools.createElement(`<svg class="caret-UIZBlm da-caret" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path></svg>`));
        this.subMenu = subMenu;
        this.subMenu.attachTo(this.getElement());
    }
}

/**
 * Creates a menu item with a checkbox.
 * @extends module:ContextMenu.MenuItem
 */
export class ToggleItem extends MenuItem {
    /**
     * @param {string} label - label to show on the menu item
     * @param {boolean} checked - should the item start out checked
     * @param {object} options - additional options for the item
     * @param {string} [options.hint=""] - hint to show on the item (usually used for key combos)
     * @param {boolean} [options.danger=false] - should the item show as danger
     * @param {module:ContextMenu~onChange} [options.callback] - callback for when the checkbox changes
     */
    constructor(label, checked, options = {}) {
        const {callback: onChange} = options;
        if (options.callback) delete options.callback;
        super(label, options);
        this.element.addClass(DiscordClasses.ContextMenu.itemToggle);
        this.element.append(DOMTools.createElement(`<div class="${DiscordClasses.ContextMenu.label}">${label}</div>`));
        this.checkbox = DOMTools.createElement(`<div class="checkbox ${DiscordClasses.Checkbox.checkbox} ${DiscordClasses.ContextMenu.checkbox}" role="button"></div>`);
        this.checkbox.append(DOMTools.createElement(`<div class="checkbox-inner ${DiscordClasses.Checkbox.checkboxInner}"></div>`));
        this.checkbox.append(DOMTools.createElement("<span>"));
        this.input = DOMTools.createElement(`<input type="checkbox" class="${DiscordClasses.Checkbox.checkboxElement}">`);
        this.input.checked = checked;
        this.checkbox.find(".checkbox-inner").append(this.input);
        this.checkbox.find(".checkbox-inner").append(DOMTools.createElement("<span>"));
        this.element.append(this.checkbox);
        this.element.on("click", (e) => {
            if (!Array.from(this.element.children).some(c => c.isSameNode(e.target)) && !this.element.isSameNode(e.target)) return;
            e.stopPropagation();
            this.input.checked = !this.input.checked;
            if (typeof(onChange) == "function") onChange(this.input.checked);
        });
    }
}