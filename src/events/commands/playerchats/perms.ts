import { ActionRowBuilder, ChannelType, EmbedBuilder, OverwriteType, PermissionOverwriteManager, Snowflake, UserSelectMenuBuilder } from 'discord.js';
import { SlashCommand } from '../../../structures/interactions/SlashCommand';
import perms from '../../selectMenus/playerchat/perms';

export default new SlashCommand('perms').setDescription('Alter the user-permissions of a channel').onExecute(async (i, _ctx) => {
	if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
	if (!i.channel || i.channel.type != ChannelType.GuildText) return i.reply({ content: 'This command can only be used in a text channel', ephemeral: true });

	const permissions = i.channel.permissionOverwrites;
	if (!permissions) return i.reply({ content: 'This channel does not have any permissions', ephemeral: true });

	return i.reply(generatePermEmbed(permissions));
});

export function generatePermEmbed(permissions: PermissionOverwriteManager) {
	const embed = new EmbedBuilder();
	embed.setTitle('User Permissions');
	embed.setColor('White');

	const users: Snowflake[] = [];
	permissions.cache.forEach((v) => {
		if (v.type == OverwriteType.Member && v.allow.has('ViewChannel')) users.push(v.id);
	});

	embed.addFields({
		name: 'Users',
		value: users.length > 0 ? users.map((v) => `> <@${v}>`).join('\n') : '> None',
	});

	const row = new ActionRowBuilder<UserSelectMenuBuilder>();
	row.addComponents(perms.build());

	return { embeds: [embed], components: [row] };
}
