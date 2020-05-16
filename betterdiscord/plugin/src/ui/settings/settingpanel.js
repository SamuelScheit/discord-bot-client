import Listenable from "../../structs/listenable";
import {DOMTools} from "modules";
import SettingField from "./settingfield";
import SettingGroup from "./settinggroup";

/** 
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 * @version 1.0.2
 */
class SettingPanel extends Listenable {

    /**
     * Creates a new settings panel
     * @param {callable} onChange - callback to fire when settings change
     * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container 
     */
    constructor(onChange, ...nodes) {
        super();
        this.element = DOMTools.parseHTML(`<div class="plugin-form-container"></div>`);
        if (typeof(onChange) == "function") this.addListener(onChange);
        this.onChange = this.onChange.bind(this);
        this.append(...nodes);
    }
    
    /**
     * Creates a new settings panel
     * @param {callable} onChange - callback to fire when settings change
     * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes  - list of nodes to add to the panel container 
     * @returns {HTMLElement} - root node for the panel.
     */
    static build(onChange, ...nodes) {
        return (new SettingPanel(onChange, ...nodes)).getElement();
    }
    
    /** @returns {HTMLElement} - root node for the panel. */
    getElement() {return this.element;}

    /**
     * Adds multiple nodes to this panel.
     * @param {(...HTMLElement|...jQuery|...SettingField|...SettingGroup)} nodes - list of nodes to add to the panel container 
     * @returns {module:Settings.SettingPanel} - returns self for chaining
     */
    append(...nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] instanceof jQuery || nodes[i] instanceof Element) this.element.append(nodes[i]);
            else if (nodes[i] instanceof SettingField || nodes[i] instanceof SettingGroup) this.element.append(nodes[i].getElement());
            if (nodes[i] instanceof SettingField) {
                nodes[i].addListener(((node) => (value) => {
                    this.onChange(node.id || node.name, value);
                })(nodes[i]));
            }
            else if (nodes[i] instanceof SettingGroup) {
                nodes[i].addListener(((node) => (settingId, value) => {
                    this.onChange(node.id || node.name, settingId, value);
                })(nodes[i]));
            }
        }
        return this;
    }

    /** Fires onchange to listeners */
    onChange() {
        this.alertListeners(...arguments);
    }
}

export default SettingPanel;