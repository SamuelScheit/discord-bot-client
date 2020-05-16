/**
 * Allows an easy way to create and show popouts.
 * @module Popouts
 * @version 0.0.1
 */

import {Screen} from "structs";
import {DiscordModules, DOMTools} from "modules";

export default class Popouts {
    /**
     * Shows the user popout for a user relative to a target element
     * @param {HTMLElement} target - Element to show the popout in relation to
     * @param {object} user - Discord User object for the user to show
     * @param {object} [options] - Options to modify the request
     * @param {string} [options.guild="currentGuildId"] - Id of the guild  (uses current if not specified)
     * @param {string} [options.channel="currentChannelId"] - Id of the channel (uses current if not specified)
     * @param {string} [options.position="right"] - Positioning relative to element
     */
    static showUserPopout(target, user, options = {}) {
        const {guild = DiscordModules.SelectedGuildStore.getGuildId(), channel = DiscordModules.SelectedChannelStore.getChannelId()} = options;
        let {position = "right"} = options;
        target = DOMTools.resolveElement(target);
        if (target.getBoundingClientRect().right + 250 >= Screen.width) position = "left";
        DiscordModules.PopoutOpener.openPopout(target, {
            position: position,
            offsetX: 0,
            offsetY: 0,
            animationType: "default",
            preventInvert: false,
            zIndexBoost: 0,
            closeOnScroll: false,
            shadow: false,
            backdrop: false,
            toggleClose: true,
            render: (props) => {
                return DiscordModules.React.createElement(DiscordModules.UserPopout, Object.assign({}, props, {
                    userId: user.id,
                    guildId: guild,
                    channelId: channel
                }));
            }
        }, "ZeresLibrary");
    }
}