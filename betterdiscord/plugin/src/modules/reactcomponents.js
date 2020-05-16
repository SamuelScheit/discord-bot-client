/**
 * BetterDiscord React Component Manipulations
 * Original concept and some code by samogot - https://github.com/samogot / https://github.com/samogot/betterdiscord-plugins/tree/master/v2/1Lib%20Discord%20Internals
 *
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://github.com/JsSucks - https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Patcher from "./patcher";
import Reflection from "./reflection";
import Modules from "./discordmodules";
import DOMTools from "./domtools";
import ReactTools from "./reacttools";

class Helpers {
    static get plannedActions() {
        return this._plannedActions || (this._plannedActions = new Map());
    }

    static recursiveArray(parent, key, count = 1) {
        let index = 0;
        function* innerCall(parent, key) {
            const item = parent[key];
            if (Array.isArray(item)) {
                for (const subKey of item.keys()) {
                    yield* innerCall(item, subKey);
                }
                return;
            }
            yield {item, parent, key, index: index++, count};
        }

        return innerCall(parent, key);
    }

    static recursiveArrayCount(parent, key) {
        let count = 0;
        // eslint-disable-next-line no-empty-pattern
        for (let {} of this.recursiveArray(parent, key)) ++count;
        return this.recursiveArray(parent, key, count);
    }

    static get recursiveChildren() {
        return function* (parent, key, index = 0, count = 1) {
            const item = parent[key];
            yield {item, parent, key, index, count};
            if (item && item.props && item.props.children) {
                for (const {parent, key, index, count} of this.recursiveArrayCount(item.props, "children")) {
                    yield* this.recursiveChildren(parent, key, index, count);
                }
            }
        };
    }

    static returnFirst(iterator, process) {
        for (const child of iterator) {
            const retVal = process(child);
            if (retVal !== undefined) return retVal;
        }
    }

    static getFirstChild(rootParent, rootKey, selector) {
        const getDirectChild = (item, selector) => {
            if (item && item.props && item.props.children) {
                return this.returnFirst(this.recursiveArrayCount(item.props, "children"), checkFilter.bind(null, selector));
            }
        };
        const checkFilter = (selector, {item, parent, key, count, index}) => {
            let match = true;
            if (selector.type) match = item && selector.type === item.type;
            if (match && selector.tag) match = item && typeof item.type === "string" && selector.tag === item.type;
            if (match && selector.className) {
                match = item && item.props && typeof item.props.className === "string";
                if (match) {
                    const classes = item.props.className.split(" ");
                    if (selector.className === true) match = !!classes[0];
                    else if (typeof selector.className === "string") match = classes.includes(selector.className);
                    else if (selector.className instanceof RegExp) match = !!classes.find(cls => selector.className.test(cls));
                    else match = false;
                }
            }
            if (match && selector.text) {
                if (selector.text === true) match = typeof item === "string";
                else if (typeof selector.text === "string") match = item === selector.text;
                else if (selector.text instanceof RegExp) match = typeof item === "string" && selector.text.test(item);
                else match = false;
            }
            if (match && selector.nthChild) match = index === (selector.nthChild < 0 ? count + selector.nthChild : selector.nthChild);
            if (match && selector.hasChild) match = getDirectChild(item, selector.hasChild);
            if (match && selector.hasSuccessor) match = item && !!this.getFirstChild(parent, key, selector.hasSuccessor).item;
            if (match && selector.eq) {
                --selector.eq;
                return;
            }
            if (match) {
                if (selector.child) return getDirectChild(item, selector.child);
                else if (selector.successor) return this.getFirstChild(parent, key, selector.successor);
                return {item, parent, key};
            }
        };
        return this.returnFirst(this.recursiveChildren(rootParent, rootKey), checkFilter.bind(null, selector)) || {};
    }

    static parseSelector(selector) {
        if (selector.startsWith(".")) return {className: selector.substr(1)};
        if (selector.startsWith("#")) return {id: selector.substr(1)};
        return {};
    }

    static findByProp(obj, what, value) {
        if (obj.hasOwnProperty(what) && obj[what] === value) return obj;
        if (obj.props && !obj.children) return this.findByProp(obj.props, what, value);
        if (!obj.children) return null;
        if (!Array.isArray(obj.children)) return this.findByProp(obj.children, what, value);
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findByProp(child, what, value);
            if (findInChild) return findInChild;
        }
        return null;
    }

    static findProp(obj, what) {
        if (obj.hasOwnProperty(what)) return obj[what];
        if (obj.props && !obj.children) return this.findProp(obj.props, what);
        if (!obj.children) return null;
        if (!Array.isArray(obj.children)) return this.findProp(obj.children, what);
        for (const child of obj.children) {
            if (!child) continue;
            const findInChild = this.findProp(child, what);
            if (findInChild) return findInChild;
        }
        return null;
    }

    static get React() {
        return Modules.React;
    }

    static get ReactDOM() {
        return Modules.ReactDOM;
    }
}

export {Helpers as ReactHelpers};

class ReactComponent {
    constructor(id, component, selector, filter) {
        this.id = id;
        this.component = component;
        // this.important = important;
        this.selector = selector;
        this.filter = filter;
    }

    forceUpdateAll() {
        if (!this.selector) return;
        for (const e of document.querySelectorAll(this.selector)) {
            Reflection(e).forceUpdate(this);
        }
    }
}

/**
 * Methods for obtaining and interacting with react components.
 * @module ReactComponents
 * @version 0.0.1
 */
export default class ReactComponents {
    static get components() {return this._components || (this._components = new Map());}
    static get unknownComponents() {return this._unknownComponents || (this._unknownComponents = new Set());}
    static get listeners() {return this._listeners || (this._listeners = new Map());}
    static get nameSetters() {return this._nameSetters || (this._nameSetters = new Set());}

    static get ReactComponent() {return ReactComponent;}
    static get Helpers() {return Helpers;}
    static get AutoPatcher() {return ReactAutoPatcher;}

    static push(component, selector, filter) {
        if (typeof(component) !== "function") return null;
        const {displayName} = component;
        if (!displayName) return this.processUnknown(component);

        const have = this.components.get(displayName);
        if (have) {
            if (!have.selector) have.selector = selector;
            if (!have.filter) have.filter = filter;
            return component;
        }

        const c = new ReactComponent(displayName, component, selector, filter);
        this.components.set(c.id, c);
        // if (!have) this.components.push(c);

        const listener = this.listeners.get(displayName);
        if (listener) {
            for (const l of listener.children) l(c);
            this.listeners.delete(listener);
        }

        // for (const listen of this.listeners) {
        //     if (!listen.filter) continue;
        // }

        return c;
    }

    /**
     * Finds a component from the components array or by waiting for it to be mounted.
     * @param {String} name The component's name
     * @param {Object} selector A selector to look for
     * @return {Promise<ReactComponent>}
     */
    static async getComponentByName(name, selector) {
        return this.getComponent(name, selector, m => m.displayName == name);
    }

    /**
     * Finds a component from the components array or by waiting for it to be mounted.
     * @param {String} name The component's name
     * @param {Object} selector A selector to look for
     * @param {Function} filter A function to filter components if a single element is rendered by multiple components
     * @return {Promise<ReactComponent>}
     */
    static async getComponent(name, selector, filter) {
        const have = this.components.get(name);
        if (have) {
            if (!have.selector) have.selector = selector;
            if (!have.filter) have.filter = filter;
            return have;
        }

        if (selector) {
            const callback = () => {
                if (this.components.get(name)) {
                    // Logger.info("ReactComponents", `Important component ${name} already found`);
                    DOMTools.observer.unsubscribe(observerSubscription);
                    return;
                }

                const elements = document.querySelectorAll(selector);
                if (!elements.length) return;

                let component, reflect;
                for (const element of elements) {
                    reflect = Reflection(element);
                    component = filter ? reflect.components.find(filter) : reflect.component;
                    if (component) break;
                }

                if (!component && filter) return;// Logger.log("ReactComponents", ["Found elements matching the query selector but no components passed the filter"]);

                DOMTools.observer.unsubscribe(observerSubscription);

                if (!component) return;// Logger.err("ReactComponents", [`FAILED TO GET IMPORTANT COMPONENT ${name} WITH REFLECTION FROM`, elements]);

                if (!component.displayName) component.displayName = name;
                // if (component.displayName && component.displayName != name) {
                //     let existing = this.listeners.find(l => l.id === component.displayName);
                //     let current = this.listeners.find(l => l.id === name);
                //     if (!existing) {current.id = component.displayName;}
                //     else {
                //         existing.listeners.push(current.listeners);
                //         Utilities.removeFromArray(this.listeners, current);
                //     }
                // }
                //Logger.info("ReactComponents", [`Found important component ${name} with reflection`, reflect]);

                this.push(component, selector, filter);
            };

            const observerSubscription = DOMTools.observer.subscribeToQuerySelector(callback, selector, null, true);
            setTimeout(callback, 0);
        }

        let listener = this.listeners.get(name);
        if (!listener) {
            listener = {
                id: name,
                children: [],
                filter
            };
            this.listeners.set(name, listener);
        }


        return new Promise(resolve => {
            listener.children.push(resolve);
        });
    }

    static setName(name, filter) {
        const have = this.components.get(name);
        if (have) return have;

        for (const component of this.unknownComponents.entries()) {
            if (!filter(component)) continue;
            component.displayName = name;
            this.unknownComponents.delete(component);
            return this.push(component);
        }
        return this.nameSetters.add({name, filter});
    }

    static processUnknown(component) {
        const have = this.unknownComponents.has(component);
        for (const setter of this.nameSetters.entries()) {
            if (setter.filter.filter(component)) {
                component.displayName = setter.name;
                this.nameSetters.delete(setter);
                return this.push(component);
            }
        }
        if (have) return have;
        this.unknownComponents.add(component);
        return component;
    }

    static *recursiveComponents(internalInstance = ReactTools.rootInstance) {
        if (internalInstance.stateNode) yield internalInstance.stateNode;
        if (internalInstance.sibling) yield *this.recursiveComponents(internalInstance.sibling);
        if (internalInstance.child) yield *this.recursiveComponents(internalInstance.child);
    }
}

class ReactAutoPatcher {
    /**
     * Wait for React to be loaded and patch it's createElement to store all unknown components.
     * Also patches some known components.
     */
    static async autoPatch() {
        this.autoUnpatch();
        Patcher.before("ReactComponents", Modules.React, "createElement", (react, [component]) => ReactComponents.push(component));
        Patcher.instead("ReactComponents", Modules.React.Component.prototype, "UNSAFE_componentWillMount", (component) => ReactComponents.push(component));
        Patcher.instead("ReactComponents", Modules.React.Component.prototype, "componentWillMount", (component) => ReactComponents.push(component));
        // this.patchComponents();
    }

    static async autoUnpatch() {
        Patcher.unpatchAll("ReactComponents");
    }

    /**
     * Finds and processes all currently available react components.
     */
    static processAll() {
        for (const component of ReactComponents.recursiveComponents()) {
            ReactComponents.push(component.constructor);
        }
    }
}
