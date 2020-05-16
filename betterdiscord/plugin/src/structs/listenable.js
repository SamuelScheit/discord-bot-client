/**
 * Acts as an interface for anything that should be listenable.
 */
class Listenable {

    constructor() {
        this.listeners = [];
    }

    /**
     * Adds a listener to the current object.
     * @param {callable} callback - callback for when the event occurs
     * @returns {callable} - a way to cancel the listener without needing to call `removeListener`
     */
    addListener(callback) {
        if (typeof(callback) !== "function") return;
        this.listeners.push(callback);
        return () => {
            this.listeners.splice(this.listeners.indexOf(callback), 1);
        };
    }

    /**
     * Removes a listener from the current object.
     * @param {callable} callback - callback that was originally registered
     */
    removeListener(callback) {
        if (typeof(callback) !== "function") return;
        this.listeners.splice(this.listeners.indexOf(callback), 1);
    }
    
    /**
     * Alerts the listeners that an event occurred. Data passed is optional
     * @param {*} [...data] - Any data desired to be passed to listeners 
     */
    alertListeners(...data) {
        for (let l = 0; l < this.listeners.length; l++) this.listeners[l](...data);
    }
}

export default Listenable;