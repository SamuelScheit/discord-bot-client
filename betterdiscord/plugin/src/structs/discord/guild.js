/**
 * BetterDiscord Guild Struct
 * Copyright (c) 2018-present JsSucks
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/JsSucks/BetterDiscordApp/blob/master/LICENSE
*/

import {DiscordAPI, DiscordModules as Modules, Utilities} from "modules";
import {List, InsufficientPermissions} from "structs";
import {Channel} from "./channel";
import {GuildMember} from "./user";

const roles = new WeakMap();

export class Role {
    constructor(data, guild_id) {
        if (roles.has(data)) return roles.get(data);
        roles.set(data, this);

        this.discordObject = data;
        this.guildId = guild_id;
    }

    get id() { return this.discordObject.id; }
    get name() { return this.discordObject.name; }
    get position() { return this.discordObject.position; }
    get originalPosition() { return this.discordObject.originalPosition; }
    get permissions() { return this.discordObject.permissions; }
    get managed() { return this.discordObject.managed; }
    get mentionable() { return this.discordObject.mentionable; }
    get hoist() { return this.discordObject.hoist; }
    get colour() { return this.discordObject.color; }
    get colourString() { return this.discordObject.colorString; }

    get guild() {
        return Guild.fromId(this.guildId);
    }

    get members() {
        return this.guild.members.filter(m => m.roles.includes(this));
    }
}

const emojis = new WeakMap();

export class Emoji {
    constructor(data) {
        if (emojis.has(data)) return emojis.get(data);
        emojis.set(data, this);

        this.discordObject = data;
    }

    get id() { return this.discordObject.id; }
    get guildId() { return this.discordObject.guild_id; }
    get name() { return this.discordObject.name; }
    get managed() { return this.discordObject.managed; }
    get animated() { return this.discordObject.animated; }
    get allNamesString() { return this.discordObject.allNamesString; }
    get requireColons() { return this.discordObject.require_colons; }
    get url() { return this.discordObject.url; }
    get roles() { return this.discordObject.roles; }

    get guild() {
        return Guild.fromId(this.guildId);
    }
}

const guilds = new WeakMap();

/**
 * @memberof module:DiscordAPI
 */
class Guild {

    constructor(data) {
        if (guilds.has(data)) return guilds.get(data);
        guilds.set(data, this);

        this.discordObject = data;
    }

    static from(data) {
        return new Guild(data);
    }

    static fromId(id) {
        const guild = Modules.GuildStore.getGuild(id);
        if (guild) return Guild.from(guild);
    }

    static get Role() { return Role; }
    static get Emoji() { return Emoji; }

    get id() { return this.discordObject.id; }
    get ownerId() { return this.discordObject.ownerId; }
    get applicationId() { return this.discordObject.application_id; }
    get systemChannelId() { return this.discordObject.systemChannelId; }
    get name() { return this.discordObject.name; }
    get acronym() { return this.discordObject.acronym; }
    get icon() { return this.discordObject.icon; }
    get joinedAt() { return this.discordObject.joinedAt; }
    get verificationLevel() { return this.discordObject.verificationLevel; }
    get mfaLevel() { return this.discordObject.mfaLevel; }
    get large() { return this.discordObject.large; }
    get lazy() { return this.discordObject.lazy; }
    get voiceRegion() { return this.discordObject.region; }
    get afkChannelId() { return this.discordObject.afkChannelId; }
    get afkTimeout() { return this.discordObject.afkTimeout; }
    get explicitContentFilter() { return this.discordObject.explicitContentFilter; }
    get defaultMessageNotifications() { return this.discordObject.defaultMessageNotifications; }
    get splash() { return this.discordObject.splash; }
    get features() { return this.discordObject.features; }

    get owner() {
        return this.members.find(m => m.userId === this.ownerId);
    }

    get roles() {
        return List.from(Object.values(this.discordObject.roles), r => new Role(r, this.id))
            .sort((r1, r2) => r1.position === r2.position ? 0 : r1.position > r2.position ? 1 : -1);
    }

    get channels() {
        const channels = Modules.GuildChannelsStore.getChannels(this.id);
        const returnChannels = new List();
        for (const category in channels) {
            if (channels.hasOwnProperty(category)) {
                if (!Array.isArray(channels[category])) continue;
                const channelList = channels[category];
                for (const channel of channelList) {
                    // For some reason Discord adds a new category with the ID "null" and name "Uncategorized"
                    if (channel.channel.id === "null") continue;
                    returnChannels.push(Channel.from(channel.channel));
                }
            }
        }
        return returnChannels;
    }

    /**
     * Channels that don't have a parent. (Channel categories and any text/voice channel not in one.)
     */
    get mainChannels() {
        return this.channels.filter(c => !c.parentId);
    }

    /**
     * The guild's default channel. (Usually the first in the list.)
     */
    get defaultChannel() {
        return Channel.from(Modules.GuildChannelsStore.getDefaultChannel(this.id));
    }

    /**
     * The guild's AFK channel.
     */
    get afkChannel() {
        if (this.afkChannelId) return Channel.fromId(this.afkChannelId);
        return null;
    }

    /**
     * The channel system messages are sent to.
     */
    get systemChannel() {
        if (this.systemChannelId) return Channel.fromId(this.systemChannelId);
        return null;
    }

    /**
     * A list of GuildMember objects.
     */
    get members() {
        const members = Modules.GuildMemberStore.getMembers(this.id);
        return List.from(members, m => new GuildMember(m, this.id));
    }

    /**
     * The current user as a GuildMember of this guild.
     */
    get currentUser() {
        return this.members.find(m => m.user === DiscordAPI.currentUser);
    }

    /**
     * The total number of members in the guild.
     */
    get memberCount() {
        return Modules.MemberCountStore.getMemberCount(this.id);
    }

    /**
     * An array of the guild's custom emojis.
     */
    get emojis() {
        return List.from(Modules.EmojiUtils.getGuildEmoji(this.id), e => new Emoji(e));
    }

    checkPermissions(perms) {
        return Modules.Permissions.can(perms, DiscordAPI.currentUser, this.discordObject);
    }

    assertPermissions(name, perms) {
        if (!this.checkPermissions(perms)) throw new InsufficientPermissions(name);
    }

    /**
     * The current user's permissions on this guild.
     */
    get permissions() {
        return Modules.GuildPermissions.getGuildPermissions(this.id);
    }

    getMember(id) {
        const member = Modules.GuildMemberStore.getMember(this.id, id);
        if (member) return new GuildMember(member, this.id);
    }

    isMember(id) {
        return Modules.GuildMemberStore.isMember(this.id, id);
    }

    /**
     * Whether the user has not restricted direct messages from members of this guild.
     */
    get allowPrivateMessages() {
        return !DiscordAPI.UserSettings.restrictedGuildIds.includes(this.id);
    }

    /**
     * Marks all messages in the guild as read.
     */
    markAsRead() {
        Modules.GuildActions.markGuildAsRead(this.id);
    }

    /**
     * Selects the guild in the UI.
     */
    select() {
        Modules.GuildActions.selectGuild(this.id);
    }

    /**
     * Whether this guild is currently selected.
     */
    get isSelected() {
        return DiscordAPI.currentGuild === this;
    }

    /**
     * Opens this guild's settings window.
     * @param {String} section The section to open (see DiscordConstants.GuildSettingsSections)
     */
    openSettings(section = "OVERVIEW") {
        Modules.GuildSettingsWindow.setSection(section);
        Modules.GuildSettingsWindow.open(this.id);
    }

    /**
     * Kicks members who don't have any roles and haven't been seen in the number of days passed.
     * @param {Number} days
     */
    pruneMembers(days) {
        this.assertPermissions("KICK_MEMBERS", Modules.DiscordPermissions.KICK_MEMBERS);
        Modules.PruneMembersModal.prune(this.id, days);
    }

    openPruneMumbersModal() {
        this.assertPermissions("KICK_MEMBERS", Modules.DiscordPermissions.KICK_MEMBERS);
        Modules.PruneMembersModal.open(this.id);
    }

    /**
     * Opens the create channel modal for this guild.
     * @param {Number} type The type of channel to create - either 0 (text), 2 (voice) or 4 (category)
     * @param {ChannelCategory} category The category to create the channel in
     * @param {GuildChannel} clone A channel to clone permissions, topic, bitrate and user limit of
     */
    openCreateChannelModal(type, category, clone) {
        this.assertPermissions("MANAGE_CHANNELS", Modules.DiscordPermissions.MANAGE_CHANNELS);
        Modules.CreateChannelModal.open(type, this.id, category ? category.id : undefined, clone ? clone.id : undefined);
    }

    /**
     * Creates a channel in this guild.
     * @param {Number} type The type of channel to create - either 0 (text), 2 (voice) or 4 (category)
     * @param {String} name A name for the new channel
     * @param {ChannelCategory} category The category to create the channel in
     * @param {Array} permission_overwrites An array of PermissionOverwrite-like objects - leave to use the permissions of the category
     * @return {Promise<GuildChannel>}
     */
    async createChannel(type, name, category, permission_overwrites) {
        this.assertPermissions("MANAGE_CHANNELS", Modules.DiscordPermissions.MANAGE_CHANNELS);
        const response = await Modules.APIModule.post({
            url: Modules.DiscordConstants.Endpoints.GUILD_CHANNELS(this.id),
            body: {
                type, name,
                parent_id: category ? category.id : undefined,
                permission_overwrites: permission_overwrites ? permission_overwrites.map(p => ({
                    type: p.type,
                    id: (p.type === "user" ? p.userId : p.roleId) || p.id,
                    allow: p.allow,
                    deny: p.deny
                })) : undefined
            }
        });

        return Channel.fromId(response.body.id);
    }

    openNotificationSettingsModal() {
        Modules.NotificationSettingsModal.open(this.id);
    }

    openPrivacySettingsModal() {
        Modules.PrivacySettingsModal.open(this.id);
    }

    nsfwAgree() {
        Modules.GuildActions.nsfwAgree(this.id);
    }

    nsfwDisagree() {
        Modules.GuildActions.nsfwDisagree(this.id);
    }

    /**
     * Changes the guild's position in the list.
     * @param {Number} index The new position
     */
    changeSortLocation(index) {
        Modules.GuildActions.move(DiscordAPI.guildPositions.indexOf(this.id), index);
    }

    /**
     * Updates this guild.
     * @return {Promise}
     */
    async updateGuild(body) {
        this.assertPermissions("MANAGE_GUILD", Modules.DiscordPermissions.MANAGE_GUILD);
        await Modules.GuildSettingsWindow.saveGuild(this.id, body);
        this.discordObject = Modules.GuildStore.getGuild(this.id);
        guilds.set(this.discordObject, this);
    }

    /**
     * Updates this guild's name.
     * @param {String} name The new name
     * @return {Promise}
     */
    updateName(name) {
        return this.updateGuild({name});
    }

    /**
     * Updates this guild's voice region.
     * @param {String} region The ID of the new voice region (obtainable via the API - see https://discordapp.com/developers/docs/resources/voice#list-voice-regions)
     * @return {Promise}
     */
    updateVoiceRegion(region) {
        return this.updateGuild({region});
    }

    /**
     * Updates this guild's verification level.
     * @param {Number} verificationLevel The new verification level (see https://discordapp.com/developers/docs/resources/guild#guild-object-verification-level)
     * @return {Promise}
     */
    updateVerificationLevel(verification_level) {
        return this.updateGuild({verification_level});
    }

    /**
     * Updates this guild's default message notification level.
     * @param {Number} defaultMessageNotifications The new default notification level (0: all messages, 1: only mentions)
     * @return {Promise}
     */
    updateDefaultMessageNotifications(default_message_notifications) {
        return this.updateGuild({default_message_notifications});
    }

    /**
     * Updates this guild's explicit content filter level.
     * @param {Number} explicitContentFilter The new explicit content filter level (0: disabled, 1: members without roles, 2: everyone)
     * @return {Promise}
     */
    updateExplicitContentFilter(explicit_content_filter) {
        return this.updateGuild({explicit_content_filter});
    }

    /**
     * Updates this guild's AFK channel.
     * @param {GuildVoiceChannel} afkChannel The new AFK channel
     * @return {Promise}
     */
    updateAfkChannel(afk_channel) {
        return this.updateGuild({afk_channel_id: afk_channel.id || afk_channel});
    }

    /**
     * Updates this guild's AFK timeout.
     * @param {Number} afkTimeout The new AFK timeout
     * @return {Promise}
     */
    updateAfkTimeout(afk_timeout) {
        return this.updateGuild({afk_timeout});
    }

    /**
     * Updates this guild's icon.
     * @param {Buffer|String} icon A buffer/base 64 encoded 128x128 JPEG image
     * @return {Promise}
     */
    updateIcon(icon) {
        return this.updateGuild({icon: typeof icon === "string" ? icon : icon.toString("base64")});
    }

    /**
     * Updates this guild's icon using a local file.
     * TODO
     * @param {String} icon_path The path to the new icon
     * @return {Promise}
     */
    async updateIconFromFile(icon_path) {
        const buffer = await Utilities.readFileBuffer(icon_path);
        return this.updateIcon(buffer);
    }

    /**
     * Updates this guild's owner. (Should plugins really ever need to do this?)
     * @param {User|GuildMember} owner The user/guild member to transfer ownership to
     * @return {Promise}
     */
    updateOwner(owner) {
        return this.updateGuild({owner_id: owner.user ? owner.user.id : owner.id || owner});
    }

    /**
     * Updates this guild's splash image.
     * (I don't know what this is actually used for. The API documentation says it's VIP-only.)
     * @param {Buffer|String} icon A buffer/base 64 encoded 128x128 JPEG image
     * @return {Promise}
     */
    updateSplash(splash) {
        return this.updateGuild({splash: typeof splash === "string" ? splash : splash.toString("base64")});
    }

    /**
     * Updates this guild's splash image using a local file.
     * TODO
     * @param {String} splash_path The path to the new splash
     * @return {Promise}
     */
    async updateSplashFromFile(splash_path) {
        const buffer = await Utilities.readFileBuffer(splash_path);
        return this.updateSplash(buffer);
    }

    /**
     * Updates this guild's system channel.
     * @param {GuildTextChannel} systemChannel The new system channel
     * @return {Promise}
     */
    updateSystemChannel(system_channel) {
        return this.updateGuild({system_channel_id: system_channel.id || system_channel});
    }

}

export {Guild};