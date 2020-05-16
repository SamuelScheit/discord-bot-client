import Listenable from "../../structs/listenable";
import {DiscordModules, DOMTools, DiscordClasses, ReactTools, WebpackModules} from "modules";

/** 
 * Setting field to extend to create new settings
 * @memberof module:Settings
 * @version 1.0.1
 */
class SettingField extends Listenable {
    /**
     * @param {string} name - name label of the setting 
     * @param {string} note - help/note to show underneath or above the setting
     * @param {callable} onChange - callback to perform on setting change
     * @param {(ReactComponent|HTMLElement)} settingtype - actual setting to render 
     * @param {object} [props] - object of props to give to the setting and the settingtype
     * @param {boolean} [props.noteOnTop=false] - determines if the note should be shown above the element or not.
     */
    constructor(name, note, onChange, settingtype, props = {}) {
        super();
        this.name = name;
        this.note = note;
        if (typeof(onChange) == "function") this.addListener(onChange);
        this.inputWrapper = DOMTools.parseHTML(`<div class="plugin-input-container"></div>`);
        this.type = typeof(settingtype) == "function" ? settingtype : ReactTools.wrapElement(settingtype);
        this.props = props;
        DOMTools.onAdded(this.getElement(), () => {this.onAdded();});
        DOMTools.onRemoved(this.getElement(), () => {this.onRemoved();});
    }

    /** @returns {HTMLElement} - root element for setting */
    getElement() { return this.inputWrapper; }

    /** Fires onchange to listeners */
    onChange() {
        this.alertListeners(...arguments);
    }

    /** Fired when root node added to DOM */
    onAdded() {
        const reactElement = DiscordModules.ReactDOM.render(DiscordModules.React.createElement(ReactSetting, Object.assign({
            title: this.name,
            type: this.type,
            note: this.note,
        }, this.props)), this.getElement());

        if (this.props.onChange) reactElement.props.onChange = this.props.onChange(reactElement);
        reactElement.forceUpdate();
    }

    /** Fired when root node removed from DOM */
    onRemoved() {
        DiscordModules.ReactDOM.unmountComponentAtNode(this.getElement());
    }
}

export default SettingField;

class ReactSetting extends DiscordModules.React.Component {
    constructor(props) {
        super(props);
    }

    get noteElement() {
        const className = this.props.noteOnTop ? DiscordClasses.Margins.marginBottom8 : DiscordClasses.Margins.marginTop8;
        return DiscordModules.React.createElement(DiscordModules.SettingsNote, {children: this.props.note, type: "description", className: className.toString()});
    }

    get dividerElement() { return DiscordModules.React.createElement("div", {className: DiscordClasses.Dividers.divider.add(DiscordClasses.Dividers.dividerDefault).toString()}); }

    render() {
        const ce = DiscordModules.React.createElement;
        const SettingElement = ce(this.props.type, this.props);
        if (this.props.inline) {
            const Flex = DiscordModules.FlexChild;
            const titleDefault = WebpackModules.getByProps("titleDefault") ? WebpackModules.getByProps("titleDefault").titleDefault : "titleDefault-a8-ZSr title-31JmR4 da-titleDefault da-title";
            return ce(Flex, {direction: Flex.Direction.VERTICAL},
            ce(Flex, {align: Flex.Align.START}, 
                ce(Flex.Child, {wrap: !0},
                    ce("div", {className: titleDefault}, this.props.title)
                ),
                ce(Flex.Child, {grow: 0, shrink: 0}, SettingElement)
            ),
            this.noteElement,
            this.dividerElement
            );
        }
        
        return ce(DiscordModules.SettingsWrapper, {
            className: DiscordClasses.Margins.marginBottom20.toString(),
            title: this.props.title,
            children: [
                this.props.noteOnTop ? this.noteElement : SettingElement,
                this.props.noteOnTop ? SettingElement : this.noteElement,
                this.dividerElement
            ]
        });
    }
}

export {ReactSetting};