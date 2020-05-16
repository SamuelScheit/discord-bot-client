/** 
 * Tooltips that automatically show and hide themselves on mouseenter and mouseleave events.
 * Will also remove themselves if the node to watch is removed from DOM through
 * a MutationObserver.
 * 
 * @module Tooltip
 * @version 0.0.2
 */

import {DiscordModules} from "modules";
import Screen from "../structs/screen";

export default class Tooltip {
    /**
     * 
     * @constructor
     * @param {(HTMLElement|jQuery)} node - DOM node to monitor and show the tooltip on
     * @param {string} tip - string to show in the tooltip
     * @param {object} options - additional options for the tooltip
     * @param {string} [options.style=black] - correlates to the discord styling
     * @param {string} [options.side=top] - can be any of top, right, bottom, left
     * @param {boolean} [options.preventFlip=false] - prevents moving the tooltip to the opposite side if it is too big or goes offscreen
     * @param {boolean} [options.disabled=false] - whether the tooltip should be disabled from showing on hover
     */
    constructor(node, text, options = {}) {
        if (!(node instanceof jQuery) && !(node instanceof Element)) return undefined;
        this.node = node instanceof jQuery ? node[0] : node;
        const {style = "black", side = "top", disabled = false} = options;
        this.label = text;
        this.style = style;
        this.side = side;
        this.disabled = disabled;
        this.id = DiscordModules.KeyGenerator();

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

    /**
     * Disabled the tooltip and prevents it from showing on hover.
     */
    disable() {
        this.disabled = true;
    }

    /**
     * Enables the tooltip and allows it to show on hover.
     */
    enable() {
        this.disabled = false;
    }

    /** Hides the tooltip. Automatically called on mouseleave. */
    hide() {
        DiscordModules.Tooltips.hide(this.id);
    }
    
    /** Shows the tooltip. Automatically called on mouseenter. */
    show() {
        const {left, top, width, height} = this.node.getBoundingClientRect();
        DiscordModules.Tooltips.show(this.id, {
            position: this.side,
            text: this.label,
            color: this.style,
            targetWidth: width,
            targetHeight: height,
            windowWidth: Screen.width,
            windowHeight: Screen.height,
            x: left,
            y: top
        });
    }
}