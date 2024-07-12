import { CustomUserSelectMenuBuilder } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { ChannelType, PermissionsBitField } from 'discord.js';
import { generatePermEmbed } from '../../commands/playerchats/perms';

export default new CustomUserSelectMenuBuilder('manage-perms-player-toggle')
	.onGenerate((builder) => builder.setMaxValues(25).setMinValues(1).setPlaceholder('Users to toggle access'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');
		if (!i.channel || i.channel.type != ChannelType.GuildText) throw new InteractionError('This command can only be used in a text channel');

		const values = i.values;
		if (!values || values.length <= 0) throw new InteractionError('No users were provided');

		try {
			const perms = i.channel.permissionOverwrites.cache;

			for (const value of values) {
				const data = perms.get(value);
				const currentAllow = data?.allow.has(PermissionsBitField.Flags.ViewChannel);
				const currentDeny = data?.deny.has(PermissionsBitField.Flags.ViewChannel);

				switch (true) {
					case currentAllow:
						await i.channel.permissionOverwrites.edit(value, { ViewChannel: null });
						break;
					case currentDeny:
						await i.channel.permissionOverwrites.edit(value, { ViewChannel: true });
						break;
					default:
						await i.channel.permissionOverwrites.create(value, { ViewChannel: true });
						break;
				}
			}

			const permissions = i.channel.permissionOverwrites;

			if (!permissions) return i.reply({ content: 'This channel does not have any permissions' });
			return i.update(generatePermEmbed(permissions));
		} catch (err) {
			console.error(err);
			throw new InteractionError('Failed to toggle permissions');
		}
	});
