/**
 * BetterDiscord Discord API
 * Copyright (c) 2018-present JsSucks
 * All rights reserved.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/JsSucks/BetterDiscordApp/blob/master/LICENSE
*/

/**
 * A large list of known and useful webpack modules internal to Discord.
 * Click the filename below to see the whole list.
 * @module DiscordAPI
 * @version 0.0.1
 */
import {List, User, Channel, Guild, Message, UserSettings, InsufficientPermissions} from "structs";
import Modules from "./discordmodules";

export default class DiscordAPI {

    static get InsufficientPermissions() {return InsufficientPermissions;}
    static get List() {return List;}
    static get User() {return User;}
    static get Channel() {return Channel;}
    static get Guild() {return Guild;}
    static get Message() {return Message;}
    static get UserSettings() {return UserSettings;}

    /**
     * A list of loaded guilds.
     */
    static get guilds() {
        const guilds = Modules.GuildStore.getGuilds();
        return List.from(Object.values(guilds), g => Guild.from(g));
    }

    /**
     * A list of loaded channels.
     */
    static get channels() {
        const channels = Modules.ChannelStore.getChannels();
        return List.from(Object.values(channels), c => Channel.from(c));
    }

    /**
     * A list of loaded users.
     */
    static get users() {
        const users = Modules.UserStore.getUsers();
        return List.from(Object.values(users), u => User.from(u));
    }

    /**
     * An object mapping guild IDs to their member counts.
     */
    static get memberCounts() {
        return Modules.MemberCountStore.getMemberCounts();
    }

    /**
     * A list of guilds in the order they appear in the server list.
     */
    static get sortedGuilds() {
        const guilds = Modules.SortedGuildStore.getSortedGuilds();
        return List.from(guilds, g => Guild.from(g));
    }

    /**
     * An array of guild IDs in the order they appear in the server list.
     */
    static get guildPositions() {
        return Modules.SortedGuildStore.guildPositions;
    }

    /**
     * The currently selected guild.
     */
    static get currentGuild() {
        const guild = Modules.GuildStore.getGuild(Modules.SelectedGuildStore.getGuildId());
        return guild ? Guild.from(guild) : null;
    }

    /**
     * The currently selected channel.
     */
    static get currentChannel() {
        const channel = Modules.ChannelStore.getChannel(Modules.SelectedChannelStore.getChannelId());
        return channel ? Channel.from(channel) : null;
    }

    /**
     * The current user.
     */
    static get currentUser() {
        const user = Modules.UserStore.getCurrentUser();
        return user ? User.from(user) : null;
    }

    /**
     * A list of the current user's friends.
     */
    static get friends() {
        const friends = Modules.RelationshipStore.getFriendIDs();
        return List.from(friends, id => User.fromId(id));
    }
}