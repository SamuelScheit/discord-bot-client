/**
 * BetterDiscord Client DOM Module
 * Copyright (c) 2015-present JsSucks - https://github.com/JsSucks
 * All rights reserved.
 * https://betterdiscord.net
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
*/

import {Utilities, Logger} from "modules";

/** 
 * Representation of a MutationObserver but with helpful utilities.
 * @memberof module:DOMTools
 **/
class DOMObserver {
    constructor(root, options) {
        this.observe = this.observe.bind(this);
        this.subscribe = this.subscribe.bind(this);
        this.observerCallback = this.observerCallback.bind(this);

        this.active = false;
        this.root = root || document.getElementById("app-mount");
        this.options = options || {attributes: true, childList: true, subtree: true};

        this.observer = new MutationObserver(this.observerCallback);
        this.observe();
    }

    observerCallback(mutations) {
        for (const sub of Array.from(this.subscriptions)) {
            try {
                const filteredMutations = sub.filter ? mutations.filter(sub.filter) : mutations;

                if (sub.group) {
                    if (!filteredMutations.length) continue;
                    sub.callback.call(sub.bind || sub, filteredMutations);
                }
                else {
                    for (const mutation of filteredMutations) sub.callback.call(sub.bind || sub, mutation);
                }
            }
            catch (err) {
                Logger.stacktrace("DOMObserver", "Error in observer callback", err);
            }
        }
    }

    /**
     * Starts observing the element. This will be called when attaching a callback.
     * You don't need to call this manually.
     */
    observe() {
        if (this.active) return;
        this.observer.observe(this.root, this.options);
        this.active = true;
    }

    /**
     * Disconnects this observer. This stops callbacks being called, but does not unbind them.
     * You probably want to use observer.unsubscribeAll instead.
     */
    disconnect() {
        if (!this.active) return;
        this.observer.disconnect();
        this.active = false;
    }

    reconnect() {
        if (this.active) {
            this.disconnect();
            this.observe();
        }
    }

    get root() { return this._root; }
    set root(root) { this._root = root; this.reconnect(); }

    get options() { return this._options; }
    set options(options) { this._options = options; this.reconnect(); }

    get subscriptions() {
        return this._subscriptions || (this._subscriptions = []);
    }

    /**
     * Subscribes to mutations.
     * @param {Function} callback A function to call when on a mutation
     * @param {Function} filter A function to call to filter mutations
     * @param {Any} bind Something to bind the callback to
     * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
     * @return {Object}
     */
    subscribe(callback, filter, bind, group) {
        const subscription = {callback, filter, bind, group};
        this.subscriptions.push(subscription);
        this.observe();
        return subscription;
    }

    /**
     * Removes a subscription and disconnect if there are none left.
     * @param {Object} subscription A subscription object returned by observer.subscribe
     */
    unsubscribe(subscription) {
        if (!this.subscriptions.includes(subscription)) subscription = this.subscriptions.find(s => s.callback === subscription);
        Utilities.removeFromArray(this.subscriptions, subscription);
        if (!this.subscriptions.length) this.disconnect();
    }

    unsubscribeAll() {
        this.subscriptions.splice(0, this.subscriptions.length);
        this.disconnect();
    }

    /**
     * Subscribes to mutations that affect an element matching a selector.
     * @param {Function} callback A function to call when on a mutation
     * @param {Function} filter A function to call to filter mutations
     * @param {Any} bind Something to bind the callback to
     * @param {Boolean} group Whether to call the callback with an array of mutations instead of a single mutation
     * @return {Object}
     */
    subscribeToQuerySelector(callback, selector, bind, group) {
        return this.subscribe(callback, mutation => {
            return mutation.target.matches(selector) // If the target matches the selector
                || Array.from(mutation.addedNodes).concat(Array.from(mutation.removedNodes)) // Or if either an added or removed node
                    .find(n => n instanceof Element && (n.matches(selector) || n.querySelector(selector))); // match or contain an element matching the selector
        }, bind, group);
    }
}

export default DOMObserver;