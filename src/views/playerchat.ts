import { BaseMessageOptions, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import registerPlayerchatCategory from '../events/buttons/playerchat/registerPlayerchatCategory';
import { PlayerChatManager } from '../models/playerchat';

export function embedRegisterPlayerchat(): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Setup Playerchat Category');
	embed.setDescription('This category is not registered as a playerchat\nIf you wish to make this one, click the button below');
	embed.setColor('Red');
	const row = new ActionRowBuilder<ButtonBuilder>();

	row.addComponents(registerPlayerchatCategory.build());

	return {
		embeds: [embed],
		components: [row],
	};
}

export function embedBasePlayerchat(manager: PlayerChatManager): BaseMessageOptions {
	const embed = new EmbedBuilder();
	embed.setTitle('Playerchat');
	embed.setColor('White');

	embed.addFields({
		name: 'Host/s',
		value: manager.hostDiscordIds.length > 0 ? manager.hostDiscordIds.map((id) => `> <@${id}>`).join('\n') : '> None',
		inline: false,
	});

	let slotText = '';
	if (manager.playerChats.length <= 0) slotText = '> None';
	else {
		for (const slot of manager.playerChats) {
			slotText += `> <#${slot.channelId}>`;
			if (slot.playerDiscordIds.length > 0) {
				slotText += slot.playerDiscordIds.map((id) => `> <@${id}>`).join('\n');
			}
		}
	}

	embed.addFields({
		name: 'Slots',
		value: slotText,
		inline: false,
	});

	return { embeds: [embed] };
}
