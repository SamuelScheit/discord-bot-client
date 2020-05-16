/**
 * BetterDiscord Reflection Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import Logger from "./logger";
import {Filters} from "./webpackmodules";
import ReactComponents from "./reactcomponents";

class Reflection {
    static reactInternalInstance(node) {
        if (!node) return null;
        if (!Object.keys(node) || !Object.keys(node).length) return null;
        const riiKey = Object.keys(node).find(k => k.startsWith("__reactInternalInstance"));
        return riiKey ? node[riiKey] : null;
    }

    static findProp(node, prop) {
        const ii = this.reactInternalInstance(node);
        if (!ii) return null;
        const fir = this.findInReturn(ii, prop);
        if (fir) return fir;
        const fim = this.findInChildProps(ii, prop);
        if (fim) return fim;
        return null;
    }

    static findInReturn(internalInstance, prop) {
        const r = internalInstance.return;
        if (!r) return null;
        let find = this.findMemoizedProp(r, prop);
        if (find) return find;
        find = this.findMemoizedState(r, prop);
        if (find) return find;
        return this.findInReturn(r, prop);
    }

    static findMemoizedProp(obj, prop) {
        if (!obj.hasOwnProperty("memoizedProps")) return null;
        obj = obj.memoizedProps;
        return this.findPropIn(obj, prop);
    }

    static findMemoizedState(obj, prop) {
        if (!obj.hasOwnProperty("memoizedState")) return null;
        obj = obj.memoizedState;
        return this.findPropIn(obj, prop);
    }

    static findInChildProps(obj, prop) {
        try {
            const f = obj.children || obj.memoizedProps.children;
            if (!f.props) return null;
            if (!f.props.hasOwnProperty(prop)) return null;
            return f.props[prop];
        }
        catch (err) {
            return null;
        }
    }

    static findPropIn(obj, prop) {
        if (obj && !Array.isArray(obj) && obj instanceof Object && obj.hasOwnProperty(prop)) return obj[prop];
        if (obj && Array.isArray(obj)) {
            const found = obj.find(mp => {
                if (mp.props && mp.props.hasOwnProperty(prop)) return true;
            });
            if (found) return found;
        }
        return null;
    }

    static propIterator(obj, propNames) {
        if (obj === null || obj === undefined) return null;
        const curPropName = propNames.shift(1);
        if (!obj.hasOwnProperty(curPropName)) return null;
        const curProp = obj[curPropName];
        if (propNames.length === 0) {
            return curProp;
        }
        return this.propIterator(curProp, propNames);
    }

    static getState(node) {
        const stateNode = this.getStateNode(node);
        if (stateNode) return stateNode.state;
    }

    static getStateNode(node) {
        return this.getStateNodes(node)[0];
    }

    static getStateNodes(node) {
        const instance = this.reactInternalInstance(node);
        const stateNodes = [];
        let lastInstance = instance;

        while (lastInstance && lastInstance.return) {
            if (lastInstance.return.stateNode instanceof HTMLElement) break;
            if (lastInstance.return.stateNode) stateNodes.push(lastInstance.return.stateNode);
            lastInstance = lastInstance.return;
        }

        return stateNodes;
    }

    static getComponentStateNode(node, component) {
        if (component instanceof ReactComponents.ReactComponent) component = component.component;

        for (const stateNode of this.getStateNodes(node)) {
            if (stateNode instanceof component) return stateNode;
        }
    }

    static findStateNode(node, filter, first = true) {
        return this.getStateNodes(node)[first ? "find" : "filter"](filter);
    }

    static getComponent(node) {
        return this.getComponents(node)[0];
    }

    static getComponents(node) {
        const instance = this.reactInternalInstance(node);
        const components = [];
        let lastInstance = instance;

        while (lastInstance && lastInstance.return) {
            if (typeof lastInstance.return.type === "string") break;
            if (lastInstance.return.type) components.push(lastInstance.return.type);
            lastInstance = lastInstance.return;
        }

        return components;
    }

    static findComponent(node, filter, first = true) {
        return this.getComponents(node)[first ? "find" : "filter"](filter);
    }
}

const propsProxyHandler = {
    get(node, prop) {
        return Reflection.findProp(node, prop);
    }
};

export default function(node) {
    return new class ReflectionInstance {
        constructor(node) {
            if (typeof node === "string") node = document.querySelector(node);
            this.node = node instanceof window.jQuery ? node[0] : node;
        }

        get el() { return this.node; }
        get element() { return this.node; }

        get reactInternalInstance() {
            return Reflection.reactInternalInstance(this.node);
        }

        get props() {
            return new Proxy(this.node, propsProxyHandler);
        }
        get state() {
            return Reflection.getState(this.node);
        }

        get stateNode() {
            return Reflection.getStateNode(this.node);
        }
        get stateNodes() {
            return Reflection.getStateNodes(this.node);
        }
        getComponentStateNode(component) {
            return Reflection.getComponentStateNode(this.node, component);
        }
        findStateNode(filter) {
            if (typeof filter === "function") return Reflection.findStateNode(this.node, filter);
            if (filter) return Reflection.getComponentStateNode(this.node, filter);
            return Reflection.getStateNode(this.node);
        }

        get component() {
            return Reflection.getComponent(this.node);
        }
        get components() {
            return Reflection.getComponents(this.node);
        }
        getComponentByProps(props, selector) {
            return Reflection.findComponent(this.node, Filters.byProperties(props, selector));
        }
        getComponentByPrototypes(props, selector) {
            return Reflection.findComponent(this.node, Filters.byPrototypeFields(props, selector));
        }
        getComponentByRegex(regex, selector) {
            return Reflection.findComponent(this.node, Filters.byCode(regex, selector));
        }
        getComponentByDisplayName(name) {
            return Reflection.findComponent(this.node, Filters.byDisplayName(name));
        }

        forceUpdate(filter) {
            try {
                const stateNode = this.findStateNode(filter);
                if (!stateNode || !stateNode.forceUpdate) return;
                stateNode.forceUpdate();
            }
            catch (err) {
                Logger.err("Reflection", err);
            }
        }

        prop(propName) {
            const split = propName.split(".");
            const first = Reflection.findProp(this.node, split[0]);
            if (split.length === 1) return first;
            return Reflection.propIterator(first, split.slice(1));
        }
    }(node);
}
