import { type UserSelectMenuBuilder, ActionRowBuilder } from 'discord.js';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { getVoteCounter } from '../../../../models/votecounter';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '../../../../views/votecounter';
import RemovePlayersMenu from '../../../selectMenus/manageVotecount/removePlayers';
export default new CustomButtonBuilder('manage-vc-players-remove')
	.onGenerate((builder) => builder.setLabel('Remove Player/s'))
	.onExecute(async (i) => {
		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return genCreateVoteCountEmbed();
		const payload = genPlayersEmbed(vc);

		const row = new ActionRowBuilder<UserSelectMenuBuilder>();
		row.addComponents(RemovePlayersMenu.build());

		i.update({ embeds: payload.embeds, components: [row] });
	});
