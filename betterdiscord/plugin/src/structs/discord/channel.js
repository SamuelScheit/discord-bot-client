/**
 * BetterDiscord Channel Struct
 * Copyright (c) 2018-present JsSucks
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/JsSucks/BetterDiscordApp/blob/master/LICENSE
*/

import {DiscordAPI, DiscordModules as Modules} from "modules";
import {List, InsufficientPermissions} from "structs";
import {Guild} from "./guild";
import {Message} from "./message";
import {User, GuildMember} from "./user";

const cache = new WeakMap();

/**
 * @memberof module:DiscordAPI
 */
class Channel {

    constructor(data) {
        if (cache.has(data)) return cache.get(data);
        cache.set(data, this);

        this.discordObject = data;
    }

    static from(channel) {
        switch (channel.type) {
            default: return new Channel(channel);
            case 0: return new GuildTextChannel(channel);
            case 1: return new DirectMessageChannel(channel);
            case 2: return new GuildVoiceChannel(channel);
            case 3: return new GroupChannel(channel);
            case 4: return new ChannelCategory(channel);
        }
    }

    static fromId(id) {
        const channel = Modules.ChannelStore.getChannel(id);
        if (channel) return Channel.from(channel);
    }

    static get GuildChannel() { return GuildChannel; }
    static get GuildTextChannel() { return GuildTextChannel; }
    static get GuildVoiceChannel() { return GuildVoiceChannel; }
    static get ChannelCategory() { return ChannelCategory; }
    static get PrivateChannel() { return PrivateChannel; }
    static get DirectMessageChannel() { return DirectMessageChannel; }
    static get GroupChannel() { return GroupChannel; }

    get id() { return this.discordObject.id; }
    get applicationId() { return this.discordObject.application_id; }
    get type() { return this.discordObject.type; }
    get name() { return this.discordObject.name; }

    /**
     * Send a message in this channel.
     * @param {String} content The new message's content
     * @param {Boolean} parse Whether to parse the message or send it as it is
     * @return {Promise<Message>}
     */
    async sendMessage(content, parse = false) {
        if (this.assertPermissions) this.assertPermissions("SEND_MESSAGES", Modules.DiscordPermissions.VIEW_CHANNEL | Modules.DiscordPermissions.SEND_MESSAGES);

        this.select();

        if (parse) content = Modules.MessageParser.parse(this.discordObject, content);
        else content = {content};

        const response = await Modules.MessageActions._sendMessage(this.id, content);
        return Message.from(Modules.MessageStore.getMessage(this.id, response.body.id));
    }

    /**
     * Send a bot message in this channel that only the current user can see.
     * @param {String} content The new message's content
     * @return {Message}
     */
    sendBotMessage(content) {
        this.select();
        const message = Modules.MessageParser.createBotMessage(this.id, content);
        Modules.MessageActions.receiveMessage(this.id, message);
        return Message.from(Modules.MessageStore.getMessage(this.id, message.id));
    }

    /**
     * A list of messages in this channel.
     */
    get messages() {
        const messages = Modules.MessageStore.getMessages(this.id).toArray();
        return List.from(messages, m => Message.from(m));
    }

    /**
     * Jumps to the latest message in this channel.
     */
    jumpToPresent() {
        if (this.assertPermissions) this.assertPermissions("VIEW_CHANNEL", Modules.DiscordPermissions.VIEW_CHANNEL);
        if (this.hasMoreAfter) Modules.MessageActions.jumpToPresent(this.id, Modules.DiscordConstants.MAX_MESSAGES_PER_CHANNEL);
        else this.messages[this.messages.length - 1].jumpTo(false);
    }

    get hasMoreAfter() {
        return Modules.MessageStore.getMessages(this.id).hasMoreAfter;
    }

    /**
     * Sends an invite in this channel.
     * @param {String} code The invite code
     * @return {Promise<Message>}
     */
    async sendInvite(code) {
        if (this.assertPermissions) this.assertPermissions("SEND_MESSAGES", Modules.DiscordPermissions.VIEW_CHANNEL | Modules.DiscordPermissions.SEND_MESSAGES);
        const response = Modules.MessageActions.sendInvite(this.id, code);
        return Message.from(Modules.MessageStore.getMessage(this.id, response.body.id));
    }

    /**
     * Opens this channel in the UI.
     */
    select() {
        if (this.assertPermissions) this.assertPermissions("VIEW_CHANNEL", Modules.DiscordPermissions.VIEW_CHANNEL);
        Modules.NavigationUtils.transitionToGuild(this.guildId ? this.guildId : Modules.DiscordConstants.ME, this.id);
    }

    /**
     * Whether this channel is currently selected.
     */
    get isSelected() {
        return DiscordAPI.currentChannel === this;
    }

    /**
     * Updates this channel.
     * @return {Promise}
     */
    async updateChannel(body) {
        if (this.assertPermissions) this.assertPermissions("MANAGE_CHANNELS", Modules.DiscordPermissions.MANAGE_CHANNELS);
        await Modules.APIModule.patch({
            url: `${Modules.DiscordConstants.Endpoints.CHANNELS}/${this.id}`,
            body
        });
        this.discordObject = Modules.ChannelStore.getChannel(this.id);
        cache.set(this.discordObject, this);
    }

}

export {Channel};

export class PermissionOverwrite {
    constructor(data, channel_id) {
        this.discordObject = data;
        this.channelId = channel_id;
    }

    static from(data, channel_id) {
        switch (data.type) {
            default: return new PermissionOverwrite(data, channel_id);
            case "role": return new RolePermissionOverwrite(data, channel_id);
            case "member": return new MemberPermissionOverwrite(data, channel_id);
        }
    }

    static get RolePermissionOverwrite() { return RolePermissionOverwrite; }
    static get MemberPermissionOverwrite() { return MemberPermissionOverwrite; }

    get type() { return this.discordObject.type; }
    get allow() { return this.discordObject.allow; }
    get deny() { return this.discordObject.deny; }

    get channel() {
        return Channel.fromId(this.channelId);
    }

    get guild() {
        if (this.channel) return this.channel.guild;
        return null;
    }
}

export class RolePermissionOverwrite extends PermissionOverwrite {
    get roleId() { return this.discordObject.id; }

    get role() {
        if (this.guild) return this.guild.roles.find(r => r.id === this.roleId);
        return null;
    }
}

export class MemberPermissionOverwrite extends PermissionOverwrite {
    get memberId() { return this.discordObject.id; }

    get member() {
        return GuildMember.fromId(this.memberId);
    }
}

export class GuildChannel extends Channel {
    static get PermissionOverwrite() { return PermissionOverwrite; }

    get guildId() { return this.discordObject.guild_id; }
    get parentId() { return this.discordObject.parent_id; } // Channel category
    get position() { return this.discordObject.position; }
    get nicks() { return this.discordObject.nicks; }

    checkPermissions(perms) {
        return Modules.Permissions.can(perms, DiscordAPI.currentUser, this.discordObject);
    }

    assertPermissions(name, perms) {
        if (!this.checkPermissions(perms)) throw new InsufficientPermissions(name);
    }

    get category() {
        return Channel.fromId(this.parentId);
    }

    /**
     * The current user's permissions on this channel.
     */
    get permissions() {
        return Modules.GuildPermissions.getChannelPermissions(this.id);
    }

    get permissionOverwrites() {
        return List.from(Object.values(this.discordObject.permissionOverwrites), p => PermissionOverwrite.from(p, this.id));
    }

    get guild() {
        return Guild.fromId(this.guildId);
    }

    /**
     * Whether this channel is the guild's default channel.
     */
    get isDefaultChannel() {
        return Modules.GuildChannelsStore.getDefaultChannel(this.guildId).id === this.id;
    }

    /**
     * Opens this channel's settings window.
     * @param {String} section The section to open (see DiscordConstants.ChannelSettingsSections)
     */
    openSettings(section = "OVERVIEW") {
        Modules.ChannelSettingsWindow.setSection(section);
        Modules.ChannelSettingsWindow.open(this.id);
    }

    /**
     * Updates this channel's name.
     * @param {String} name The channel's new name
     * @return {Promise}
     */
    updateName(name) {
        return this.updateChannel({name});
    }

    /**
     * Changes the channel's position.
     * @param {Number} position The channel's new position
     * @return {Promise}
     */
    changeSortLocation(position = 0) {
        if (position instanceof GuildChannel) position = position.position;
        return this.updateChannel({position});
    }

    /**
     * Updates this channel's permission overwrites.
     * @param {Array} permissionOverwrites An array of permission overwrites
     * @return {Promise}
     */
    updatePermissionOverwrites(permission_overwrites) {
        return this.updateChannel({permission_overwrites});
    }

    /**
     * Updates this channel's category.
     * @param {ChannelCategory} category The new channel category
     * @return {Promise}
     */
    updateCategory(category) {
        return this.updateChannel({parent_id: category.id || category});
    }
}

// Type 0 - GUILD_TEXT
export class GuildTextChannel extends GuildChannel {
    get type() { return "GUILD_TEXT"; }
    get topic() { return this.discordObject.topic; }
    get nsfw() { return this.discordObject.nsfw; }

    /**
     * Updates this channel's topic.
     * @param {String} topc The new channel topic
     * @return {Promise}
     */
    updateTopic(topic) {
        return this.updateChannel({topic});
    }

    /**
     * Updates this channel's NSFW flag.
     * @param {Boolean} nsfw Whether the channel should be marked as NSFW
     * @return {Promise}
     */
    setNsfw(nsfw = true) {
        return this.updateChannel({nsfw});
    }

    setNotNsfw() {
        return this.setNswf(false);
    }
}

// Type 2 - GUILD_VOICE
export class GuildVoiceChannel extends GuildChannel {
    get type() { return "GUILD_VOICE"; }
    get userLimit() { return this.discordObject.userLimit; }
    get bitrate() { return this.discordObject.bitrate; }

    sendMessage() { throw new Error("Cannot send messages in a voice channel."); }
    get messages() { return new List(); }
    jumpToPresent() { throw new Error("Cannot select a voice channel."); }
    get hasMoreAfter() { return false; }
    sendInvite() { throw new Error("Cannot invite someone to a voice channel."); }
    select() { throw new Error("Cannot select a voice channel."); }

    /**
     * Updates this channel's bitrate.
     * @param {Number} bitrate The new bitrate
     * @return {Promise}
     */
    updateBitrate(bitrate) {
        return this.updateChannel({bitrate});
    }

    /**
     * Updates this channel's user limit.
     * @param {Number} userLimit The new user limit
     * @return {Promise}
     */
    updateUserLimit(user_limit) {
        return this.updateChannel({user_limit});
    }
}

// Type 4 - GUILD_CATEGORY
export class ChannelCategory extends GuildChannel {
    get type() { return "GUILD_CATEGORY"; }
    get parentId() { return undefined; }
    get category() { return undefined; }

    sendMessage() { throw new Error("Cannot send messages in a channel category."); }
    get messages() { return new List(); }
    jumpToPresent() { throw new Error("Cannot select a channel category."); }
    get hasMoreAfter() { return false; }
    sendInvite() { throw new Error("Cannot invite someone to a channel category."); }
    select() { throw new Error("Cannot select a channel category."); }
    updateCategory() { throw new Error("Cannot set a channel category on another channel category."); }

    /**
     * A list of channels in this category.
     */
    get channels() {
        return List.from(this.guild.channels, c => c.parentId === this.id);
    }

    /**
     * Opens the create channel modal for this guild.
     * @param {Number} type The type of channel to create - either 0 (text), 2 (voice) or 4 (category)
     * @param {GuildChannel} clone A channel to clone permissions of
     */
    openCreateChannelModal(type, category, clone) {
        this.guild.openCreateChannelModal(type, this.id, this, clone);
    }

    /**
     * Creates a channel in this category.
     * @param {Number} type The type of channel to create - either 0 (text) or 2 (voice)
     * @param {String} name A name for the new channel
     * @param {Array} permission_overwrites An array of PermissionOverwrite-like objects - leave to use the permissions of the category
     * @return {Promise<GuildChannel>}
     */
    createChannel(type, name, permission_overwrites) {
        return this.guild.createChannel(type, name, this, permission_overwrites);
    }
}

export class PrivateChannel extends Channel {
    get userLimit() { return this.discordObject.userLimit; }
    get bitrate() { return this.discordObject.bitrate; }
}

// Type 1 - DM
export class DirectMessageChannel extends PrivateChannel {
    get type() { return "DM"; }
    get recipientId() { return this.discordObject.recipients[0]; }

    /**
     * The other user of this direct message channel.
     */
    get recipient() {
        return User.fromId(this.recipientId);
    }
}

// Type 3 - GROUP_DM
export class GroupChannel extends PrivateChannel {
    get ownerId() { return this.discordObject.ownerId; }
    get type() { return "GROUP_DM"; }
    get name() { return this.discordObject.name; }
    get icon() { return this.discordObject.icon; }

    /**
     * A list of the other members of this group direct message channel.
     */
    get members() {
        return List.from(this.discordObject.recipients, id => User.fromId(id));
    }

    /**
     * The owner of this group direct message channel. This is usually the person who created it.
     */
    get owner() {
        return User.fromId(this.ownerId);
    }

    /**
     * Updates this channel's name.
     * @param {String} name The channel's new name
     * @return {Promise}
     */
    updateName(name) {
        return this.updateChannel({name});
    }
}


// export {Channel, GuildChannel, ChannelCategory, GuildTextChannel, GuildVoiceChannel, PrivateChannel, DirectMessageChannel, GroupChannel};
// export {PermissionOverwrite, RolePermissionOverwrite, MemberPermissionOverwrite};