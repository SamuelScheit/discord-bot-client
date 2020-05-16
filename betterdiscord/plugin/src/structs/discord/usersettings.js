/**
 * BetterDiscord Channel Struct
 * Copyright (c) 2018-present JsSucks
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/JsSucks/BetterDiscordApp/blob/master/LICENSE
*/



import {DiscordModules as Modules} from "modules";
import {List} from "structs";
import {Guild} from "./guild";

/**
 * @memberof module:DiscordAPI
 */
class UserSettings {
    /**
     * Opens Discord's settings UI.
     */
    static open(section = "ACCOUNT") {
        Modules.UserSettingsWindow.setSection(section);
        Modules.UserSettingsWindow.open();
    }

    /**
     * The user's current status. Either "online", "idle", "dnd" or "invisible".
     */
    static get status() { return Modules.UserSettingsStore.status; }

    /**
     * The user's selected explicit content filter level.
     * 0 == off, 1 == everyone except friends, 2 == everyone
     * Configurable in the privacy and safety panel.
     */
    static get explicitContentFilter() { return Modules.UserSettingsStore.explicitContentFilter; }

    /**
     * Whether to disallow direct messages from server members by default.
     */
    static get defaultGuildsRestricted() { return Modules.UserSettingsStore.defaultGuildsRestricted; }

    /**
     * An array of guilds to disallow direct messages from their members.
     * This is bypassed if the member is has another mutual guild with this disabled, or the member is friends with the current user.
     * Configurable in each server's privacy settings.
     */
    static get restrictedGuildIds() { return Modules.UserSettingsStore.restrictedGuilds; }

    static get restrictedGuilds() {
        return List.from(this.restrictedGuildIds, id => Guild.fromId(id) || id);
    }

    /**
     * An array of flags specifying who should be allowed to add the current user as a friend.
     * If everyone is checked, this will only have one item, "all". Otherwise it has either "mutual_friends", "mutual_guilds", both or neither.
     * Configurable in the privacy and safety panel.
     */
    static get friendSourceFlags() { return Object.keys(Modules.UserSettingsStore.friendSourceFlags); }
    static get friendSourceEveryone() { return this.friend_source_flags.include("all"); }
    static get friendSourceMutual_friends() { return this.friend_source_flags.include("all") || this.friend_source_flags.include("mutual_friends"); }
    static get friendSourceMutual_guilds() { return this.friend_source_flags.include("all") || this.friend_source_flags.include("mutual_guilds"); }
    static get friendSourceAnyone() { return this.friend_source_flags.length > 0; }

    /**
     * Whether to automatically add accounts from other platforms running on the user's computer.
     * Configurable in the connections panel.
     */
    static get detectPlatformAccounts() { return Modules.UserSettingsStore.detectPlatformAccounts; }

    /**
     * The number of seconds Discord will wait for activity before sending mobile push notifications.
     * Configurable in the notifications panel.
     */
    static get afkTimeout() { return Modules.UserSettingsStore.afkTimeout; }

    /**
     * Whether to display the currently running game as a status message.
     * Configurable in the games panel.
     */
    static get showCurrentGame() { return Modules.UserSettingsStore.showCurrentGame; }

    /**
     * Whether to show images uploaded directly to Discord.
     * Configurable in the text and images panel.
     */
    static get inlineAttachmentMedia() { return Modules.UserSettingsStore.inlineAttachmentMedia; }

    /**
     * Whether to show images linked in Discord.
     * Configurable in the text and images panel.
     */
    static get inlineEmbedMedia() { return Modules.UserSettingsStore.inlineEmbedMedia; }

    /**
     * Whether to automatically play GIFs when the Discord window is active without having to hover the mouse over the image.
     * Configurable in the text and images panel.
     */
    static get autoplayGifs() { return Modules.UserSettingsStore.gifAutoPlay; }

    /**
     * Whether to show content from HTTP[s] links as embeds.
     * Configurable in the text and images panel.
     */
    static get showEmbeds() { return Modules.UserSettingsStore.renderEmbeds; }

    /**
     * Whether to show a message's reactions.
     * Configurable in the text and images panel.
     */
    static get showReactions() { return Modules.UserSettingsStore.renderReactions; }

    /**
     * Whether to play animated emoji.
     * Configurable in the text and images panel.
     */
    static get animateEmoji() { return Modules.UserSettingsStore.animateEmoji; }

    /**
     * Whether to convert ASCII emoticons to emoji.
     * Configurable in the text and images panel.
     */
    static get convertEmoticons() { return Modules.UserSettingsStore.convertEmoticons; }

    /**
     * Whether to allow playing text-to-speech messages.
     * Configurable in the text and images panel.
     */
    static get allowTts() { return Modules.UserSettingsStore.enableTTSCommand; }

    /**
     * The user's selected theme. Either "dark" or "light".
     * Configurable in the appearance panel.
     */
    static get theme() { return Modules.UserSettingsStore.theme; }

    /**
     * Whether the user has enabled compact mode.
     * `true` if compact mode is enabled, `false` if cozy mode is enabled.
     * Configurable in the appearance panel.
     */
    static get displayCompact() { return Modules.UserSettingsStore.messageDisplayCompact; }

    /**
     * Whether the user has enabled developer mode.
     * Currently only adds a "Copy ID" option to the context menu on users, guilds and channels.
     * Configurable in the appearance panel.
     */
    static get developerMode() { return Modules.UserSettingsStore.developerMode; }

    /**
     * The user's selected language code.
     * Configurable in the language panel.
     */
    static get locale() { return Modules.UserSettingsStore.locale; }

    /**
     * The user's timezone offset in hours.
     * This is not configurable.
     */
    static get timezoneOffset() { return Modules.UserSettingsStore.timezoneOffset; }
}

export {UserSettings};