import Listenable from "../../structs/listenable";
import {DiscordClasses, DOMTools} from "modules";
import SettingField from "./settingfield";

/** 
 * Grouping of controls for easier management in settings panels.
 * @memberof module:Settings
 * @version 1.0.2
 */
class SettingGroup extends Listenable {
    /**
     * @param {string} groupName - title for the group of settings
     * @param {object} [options] - additional options for the group
     * @param {callback} [options.callback] - callback called on settings changed
     * @param {boolean} [options.collapsible=true] - determines if the group should be collapsible
     * @param {boolean} [options.shown=false] - determines if the group should be expanded by default
     */
    constructor(groupName, options = {}) {
        super();
        const {collapsible = true, shown = false, callback = () => {}} = options;
        this.addListener(callback);
        this.onChange = this.onChange.bind(this);

        const collapsed = shown || !collapsible ? "" : "collapsed";
        const group = DOMTools.parseHTML(`<div class="plugin-input-group">
                                            <h2 class="${DiscordClasses.Titles.h5} ${DiscordClasses.Titles.defaultMarginh5} ${DiscordClasses.Titles.defaultColor}">
                                            <span class="button-collapse ${collapsed}"></span> ${groupName}
                                            </h2>
                                            <div class="plugin-inputs collapsible ${collapsed}"></div>
                                            </div>`);
        const label = group.querySelector("h2");
        const controls = group.querySelector(".plugin-inputs");

        this.group = group;
        this.label = label;
        this.controls = controls;

        if (!collapsible) return;
        label.addEventListener("click", async () => {
            const button = label.querySelector(".button-collapse");
            const wasCollapsed = button.classList.contains("collapsed");
            group.parentElement.querySelectorAll(":scope > .plugin-input-group > .collapsible:not(.collapsed)").forEach((element) => {
                element.style.setProperty("height", element.scrollHeight + "px");
                element.classList.add("collapsed");
                setImmediate(() => {element.style.setProperty("height", "");});
            });
            group.parentElement.querySelectorAll(":scope > .plugin-input-group > h2 > .button-collapse").forEach(e => e.classList.add("collapsed"));
            if (!wasCollapsed) return;
            controls.style.setProperty("height", controls.scrollHeight + "px");
            controls.classList.remove("collapsed");
            button.classList.remove("collapsed");
            await new Promise(resolve => setTimeout(resolve, 300));
            controls.style.setProperty("height", "");
        });
    }
    
    /** @returns {HTMLElement} - root node for the group. */
    getElement() {return this.group;}
    
    /**
     * Adds multiple nodes to this group.
     * @param {(...HTMLElement|...jQuery|...module:Settings.SettingField|...module:Settings.SettingGroup)} nodes - list of nodes to add to the group container 
     * @returns {module:Settings.SettingGroup} - returns self for chaining
     */
    append(...nodes) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] instanceof jQuery || nodes[i] instanceof Element) this.controls.append(nodes[i]);
            else if (nodes[i] instanceof SettingField || nodes[i] instanceof SettingGroup) this.controls.append(nodes[i].getElement());
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
    
    /**
     * Appends this node to another
     * @param {HTMLElement} node - node to attach the group to.
     * @returns {module:Settings.SettingGroup} - returns self for chaining
     */
    appendTo(node) {
        node.append(this.group);
        return this;
    }

    /** Fires onchange to listeners */
    onChange() {
        this.alertListeners(...arguments);
    }
}

export default SettingGroup;