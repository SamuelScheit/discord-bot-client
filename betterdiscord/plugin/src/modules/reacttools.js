/**
 * Helpful utilities for dealing with getting react information from DOM objects.
 * @module ReactTools
 * @version 0.0.5
 */

import DOMTools from "./domtools";
import DiscordModules from "./discordmodules";
import Utilities from "./utilities";
import Reflection from "./reflection";

export default class ReactTools {

    /**
     * Performs reflection on a specific node.
     * @param {(HTMLElement|jQuery|Selector)} node - node or selector to reflect on.
     */
    static Reflect(node) {
        return Reflection(node);
    }

    static get rootInstance() {return document.getElementById("app-mount")._reactRootContainer._internalRoot.current;}

    /**
     * Grabs the react internal instance of a specific node.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @return {object} the internal react instance
     */
    static getReactInstance(node) {
        if (!(node instanceof window.jQuery) && !(node instanceof Element)) return undefined;
        const domNode = node instanceof window.jQuery ? node[0] : node;
        return domNode[Object.keys(domNode).find((key) => key.startsWith("__reactInternalInstance"))];
    }

    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @param {string} path - path to the requested value
     * @return {(*|undefined)} the value requested or undefined if not found.
     */
    static getReactProperty(node, path) {
        return Utilities.getNestedProp(this.getReactInstance(node), path);
    }

    /**
     * Grabs a value from the react internal instance. Allows you to grab
     * long depth values safely without accessing no longer valid properties.
     * @param {(HTMLElement|jQuery)} node - node to obtain react instance of
     * @param {object} options - options for the search
     * @param {array} [options.include] - list of items to include from the search
     * @param {array} [options.exclude=["Popout", "Tooltip", "Scroller", "BackgroundFlash"]] - list of items to exclude from the search
     * @param {callable} [options.filter=_=>_] - filter to check the current instance with (should return a boolean)
     * @return {(*|null)} the owner instance or undefined if not found.
     */
    static getOwnerInstance(node, {include, exclude = ["Popout", "Tooltip", "Scroller", "BackgroundFlash"], filter = _ => _} = {}) {
        if (node === undefined) return undefined;
        const excluding = include === undefined;
        const nameFilter = excluding ? exclude : include;
        function getDisplayName(owner) {
            const type = owner.type;
            if (!type) return null;
            return type.displayName || type.name || null;
        }
        function classFilter(owner) {
            const name = getDisplayName(owner);
            return (name !== null && !!(nameFilter.includes(name) ^ excluding));
        }
        
        let curr = this.getReactInstance(node);
        for (curr = curr && curr.return; !Utilities.isNil(curr); curr = curr.return) {
            if (Utilities.isNil(curr)) continue;
            const owner = curr.stateNode;
            if (!Utilities.isNil(owner) && !(owner instanceof HTMLElement) && classFilter(curr) && filter(owner)) return owner;
        }
        
        return null;
    }

    /**
     * Creates and renders a react element that wraps dom elements.
     * @param {(HTMLElement|Array<HTMLElement>)} element - element or array of elements to wrap into a react element
     * @returns {object} - rendered react element
     */
    static createWrappedElement(element) {
        if (Array.isArray(element)) element = DOMTools.wrap(element);
        return DiscordModules.React.createElement(this.wrapElement(element));
    }

    /**
     * Creates an unrendered react component that wraps dom elements.
     * @param {(HTMLElement|Array<HTMLElement>)} element - element or array of elements to wrap into a react component
     * @returns {object} - unrendered react component
     */
    static wrapElement(element) {
        if (Array.isArray(element)) element = DOMTools.wrap(element);
        return class ReactWrapper extends DiscordModules.React.Component {
            constructor(props) {
                super(props);
                this.element = element;
            }
    
            componentDidMount() {this.refs.element.appendChild(this.element);}
            render() {return DiscordModules.React.createElement("div", {className: "react-wrapper", ref: "element"});}
        };
    }
}