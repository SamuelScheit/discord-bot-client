/**
 * Tooltip that automatically show and hide themselves on mouseenter and mouseleave events.
 * Will also remove themselves if the node to watch is removed from DOM through
 * a MutationObserver.
 *
 * Note this is not using Discord's internals but normal DOM manipulation and emulates
 * Discord's own tooltips as closely as possible.
 *
 * @module EmulatedTooltip
 * @version 0.0.1
 */

import {DOMTools, DiscordClasses, DiscordSelectors, Logger} from "modules";
import Screen from "../structs/screen";

const getClass = function(sideOrColor) {
    const upperCase = sideOrColor[0].toUpperCase() + sideOrColor.slice(1);
    const tooltipClass = DiscordClasses.Tooltips[`tooltip${upperCase}`];
    if (tooltipClass) return tooltipClass;
    return null;
};

const classExists = function(sideOrColor) {
    return getClass(sideOrColor) ? true : false;
};

const toPx = function(value) {
    return `${value}px`;
};

/* <div class="layer-v9HyYc da-layer" style="left: 234.5px; bottom: 51px;">
    <div class="tooltip-2QfLtc da-tooltip tooltipTop-XDDSxx tooltipBlack-PPG47z">
        <div class="tooltipPointer-3ZfirK da-tooltipPointer"></div>
        User Settings
    </div>
</div> */

export default class EmulatedTooltip {
    /**
     *
     * @constructor
     * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
     * @param {string} tip - string to show in the tooltip
     * @param {object} options - additional options for the tooltip
     * @param {string} [options.style=black] - correlates to the discord styling/colors (black, brand, green, grey, red, yellow)
     * @param {string} [options.side=top] - can be any of top, right, bottom, left
     * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
     */
    constructor(node, text, options = {}) {
        const {style = "black", side = "top", preventFlip = false, disabled = false} = options;
        this.node = node instanceof jQuery ? node[0] : node;
        this.label = text;
        this.style = style.toLowerCase();
        this.side = side.toLowerCase();
        this.preventFlip = preventFlip;
        this.disabled = disabled;

        if (!classExists(this.side)) return Logger.err("EmulatedTooltip", `Side ${this.side} does not exist.`);
        if (!classExists(this.style)) return Logger.err("EmulatedTooltip", `Style ${this.style} does not exist.`);

        this.element = DOMTools.createElement(`<div class="${DiscordClasses.TooltipLayers.layer}">`);
        this.tooltipElement = DOMTools.createElement(`<div class="${DiscordClasses.Tooltips.tooltip} ${getClass(this.style)}"><div class="${DiscordClasses.Tooltips.tooltipPointer}"></div>${this.label}</div>`);
        this.labelElement = this.tooltipElement.childNodes[1];
        this.element.append(this.tooltipElement);


        this.node.addEventListener("mouseenter", () => {
            if (this.disabled) return;
            this.show();

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    const nodes = Array.from(mutation.removedNodes);
                    const directMatch = nodes.indexOf(this.node) > -1;
                    const parentMatch = nodes.some(parent => parent.contains(this.node));
                    if (directMatch || parentMatch) {
                        this.hide();
                        observer.disconnect();
                    }
                });
            });

            observer.observe(document.body, {subtree: true, childList: true});
        });

        this.node.addEventListener("mouseleave", () => {
            this.hide();
        });
    }

    /** Container where the tooltip will be appended. */
    get container() { return document.querySelector(DiscordSelectors.Popouts.popouts.sibling(DiscordSelectors.TooltipLayers.layerContainer)); }
    /** Boolean representing if the tooltip will fit on screen above the element */
    get canShowAbove() { return this.node.offset().top - this.element.outerHeight() >= 0; }
    /** Boolean representing if the tooltip will fit on screen below the element */
    get canShowBelow() { return this.node.offset().top + this.node.outerHeight() + this.element.outerHeight() <= Screen.height; }
    /** Boolean representing if the tooltip will fit on screen to the left of the element */
    get canShowLeft() { return this.node.offset().left - this.element.outerWidth() >= 0; }
    /** Boolean representing if the tooltip will fit on screen to the right of the element */
    get canShowRight() { return this.node.offset().left + this.node.outerWidth() + this.element.outerWidth() <= Screen.width; }

    /** Hides the tooltip. Automatically called on mouseleave. */
    hide() {
        this.element.remove();
        this.tooltipElement.className = this._className;
    }

    /** Shows the tooltip. Automatically called on mouseenter. Will attempt to flip if position was wrong. */
    show() {
        this.tooltipElement.className = `${DiscordClasses.Tooltips.tooltip} ${getClass(this.style)}`;
        this.labelElement.textContent = this.label;
        this.element.appendTo(this.container);

        if (this.side == "top") {
            if (this.canShowAbove || (!this.canShowAbove && this.preventFlip)) this.showAbove();
            else this.showBelow();
        }

        if (this.side == "bottom") {
            if (this.canShowBelow || (!this.canShowBelow && this.preventFlip)) this.showBelow();
            else this.showAbove();
        }

        if (this.side == "left") {
            if (this.canShowLeft || (!this.canShowLeft && this.preventFlip)) this.showLeft();
            else this.showRight();
        }

        if (this.side == "right") {
            if (this.canShowRight || (!this.canShowRight && this.preventFlip)) this.showRight();
            else this.showLeft();
        }
    }

    /** Force showing the tooltip above the node. */
    showAbove() {
        this.tooltipElement.addClass(getClass("top"));
        this.element.css("top", toPx(this.node.offset().top - this.element.outerHeight() - 10));
        this.centerHorizontally();
    }

    /** Force showing the tooltip below the node. */
    showBelow() {
        this.tooltipElement.addClass(getClass("bottom"));
        this.element.css("top", toPx(this.node.offset().top + this.node.outerHeight() + 10));
        this.centerHorizontally();
    }

    /** Force showing the tooltip to the left of the node. */
    showLeft() {
        this.tooltipElement.addClass(getClass("left"));
        this.element.css("left", toPx(this.node.offset().left - this.element.outerWidth() - 10));
        this.centerVertically();
    }

    /** Force showing the tooltip to the right of the node. */
    showRight() {
        this.tooltipElement.addClass(getClass("right"));
        this.element.css("left", toPx(this.node.offset().left + this.node.outerWidth() + 10));
        this.centerVertically();
    }

    centerHorizontally() {
        const nodecenter = this.node.offset().left + (this.node.outerWidth() / 2);
        this.element.css("left", toPx(nodecenter - (this.element.outerWidth() / 2)));
    }

    centerVertically() {
        const nodecenter = this.node.offset().top + (this.node.outerHeight() / 2);
        this.element.css("top", toPx(nodecenter - (this.element.outerHeight() / 2)));
    }
}