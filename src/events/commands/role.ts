import { SlashCommandBuilder, EmbedBuilder, type ColorResolvable } from 'discord.js';
import { newSlashCommand } from '@structures/interactions/SlashCommand';
import { capitalize } from '@utils/string';
import { getRoleByName, getRoleNames } from '@models/gameRoles';

const data = new SlashCommandBuilder().setName('role').setDescription('View a role');
data.addStringOption((option) => option.setName('name').setDescription('The name of the role').setRequired(true).setAutocomplete(true));

export default newSlashCommand({
	data,
	execute: async (i) => {
		if (!i.guild) return;
		const name = i.options.getString('name', true);

		const role = await getRoleByName(name);
		if (!role) return i.reply({ content: 'Role not found', ephemeral: true });

		const embed = new EmbedBuilder();
		embed.setTitle(`${role.name} - ${role.alignment} ${role.subAlignment}`);
		embed.setColor(role.roleColour as ColorResolvable);

		if (role.flavourText) embed.setDescription(`*${role.flavourText}*`);
		if (role.wikiUrl) embed.setURL(role.wikiUrl);
		if (role.isRetired)
			embed.setFooter({
				text: 'This role is retired',
			});

		embed.addFields(
			{
				name: 'Abilities',
				value: role.abilities,
			},
			{
				name: 'Win Condition',
				value: role.winCondition,
			}
		);

		await i.reply({ embeds: [embed], ephemeral: false });
	},

	autocomplete: async (i) => {
		const focused = i.options.getFocused();

		const fetchNames = await getRoleNames(focused, {
			take: 5,
		});
		if (!fetchNames) return i.respond([]);

		console.log(fetchNames);

		return i.respond(fetchNames.map((m) => ({ name: capitalize(m.name), value: m.name })));
	},
});