/** 
 * Representation of a Selector
 * @memberof module:DOMTools
 **/
class Selector {
    /**
     * 
     * @param {string} classname - class to create selector for
     */
    constructor(className) {
        this.value = " ." + className.split(" ").join(".");
    }
    
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */
    toString() {
        return this.value;
    }
    
    /**
     * Returns the raw selector, this is how native function get the value.
     * @returns {string} raw selector.
     */
    valueOf() {
        return this.value;
    }
    
    selector(symbol, other) {
        this.value = `${this.toString()} ${symbol} ${other.toString()}`;
        return this;
    }
    
    /**
     * Adds another selector as a direct child `>` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as child
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    child(other) {
        return this.selector(">", other);
    }
    
    /**
     * Adds another selector as a adjacent sibling `+` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as adjacent sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    adjacent(other) {
        return this.selector("+", other);
    }
    
    /**
     * Adds another selector as a general sibling `~` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as sibling
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    sibling(other) {
        return this.selector("~", other);
    }
    
    /**
     * Adds another selector as a descendent `(space)` to this one.
     * @param {string|DOMTools.Selector} other - Selector to add as descendent
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    descend(other) {
        return this.selector(" ", other);
    }

    /**
     * Adds another selector to this one via `,`.
     * @param {string|DOMTools.Selector} other - Selector to add
     * @returns {DOMTools.Selector} returns self to allow chaining
     */
    and(other) {
        return this.selector(",", other);
    }
}

export default Selector;