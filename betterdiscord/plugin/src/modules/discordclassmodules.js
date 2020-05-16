import Utilities from "./utilities";
import WebpackModules from "./webpackmodules";

/**
 * A large list of known and labelled classes in discord.
 * Click the source link down below to view more info. Otherwise, if you
 * have the library installed or have a plugin using this library,
 * do `Object.keys(ZLibrary.DiscordClassModules)` in console for a list of modules.
 * 
 * You can use this directly, however the preferred way of doing this is to use {@link module:DiscordClasses} or {@link module:DiscordSelectors}
 * 
 * @see module:DiscordClasses
 * @see module:DiscordSelectors
 * @module DiscordClassModules
 * @version 0.0.2
 */
export default Utilities.memoizeObject({
    get ContextMenu() {return WebpackModules.getByProps("itemToggle");},
    get Scrollers() {return WebpackModules.getByProps("scrollerWrap", "scrollerThemed", "scrollerTrack");},
    get AccountDetails() {return WebpackModules.getByProps("container", "avatar", "hasBuildOverride");},
    get Typing() {return WebpackModules.getByProps("typing", "text");},
    get UserPopout() {return WebpackModules.getByProps("userPopout");},
    get PopoutRoles() {return WebpackModules.getByProps("roleCircle");},
    get UserModal() {return WebpackModules.getByProps("profileBadge");},
    get Textarea() {return WebpackModules.getByProps("channelTextArea", "textArea");},
    get Popouts() {return WebpackModules.getByProps("popouts");},
    get Titles() {return WebpackModules.getByProps("defaultMarginh5");},
    get Notices() {return WebpackModules.getByProps("noticeInfo");},
    get Backdrop() {return WebpackModules.getByProps("backdrop");},
    get Modals() {return WebpackModules.getModule(m => m.modal && m.inner && !m.header);},
    get AuditLog() {return WebpackModules.getByProps("userHook");},
    get ChannelList() {return Object.assign({}, WebpackModules.getByProps("containerDefault"), WebpackModules.getByProps("name", "unread"), WebpackModules.getByProps("sidebar", "hasNotice"));},
    get MemberList() {return Object.assign({}, WebpackModules.getByProps("member", "memberInner"), WebpackModules.getByProps("members", "membersWrap"));},
    get TitleWrap() {return WebpackModules.getByProps("titleWrapper");},
    get Titlebar() {return WebpackModules.getByProps("titleBar");},
    get Embeds() {return WebpackModules.getByProps("embed", "embedAuthor");},
    get Layers() {return WebpackModules.getByProps("layers", "layer");},
    get TooltipLayers() {return WebpackModules.getByProps("layerContainer", "layer");},
    get Margins() {return WebpackModules.getModule(m => !m.title && m.marginBottom40 && m.marginTop40);},
    get Dividers() {return Object.assign({}, WebpackModules.getByProps("dividerDefault"), WebpackModules.getModule(m => Object.keys(m).length == 1 && m.divider));},
    get Changelog() {return Object.assign({}, WebpackModules.getByProps("container", "added"), WebpackModules.getByProps("content", "modal", "size"));},
    get BasicInputs() {return WebpackModules.getByProps("inputDefault");},
    get Messages() {return WebpackModules.getByProps("message", "containerCozy");},
    get Guilds() {return WebpackModules.getByProps("guildsWrapper");},
    get EmojiPicker() {return WebpackModules.getByProps("emojiPicker", "emojiItem");},
    get Reactions() {return WebpackModules.getByProps("reaction", "reactionInner");},
    get Checkbox() {return WebpackModules.getByProps("checkbox", "checkboxInner");},
    get Tooltips() {return WebpackModules.getByProps("tooltip", "tooltipBlack");}
});

