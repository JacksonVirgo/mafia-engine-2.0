import { ChannelType } from 'discord.js';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { getPlayerChatManager, registerPlayerChatCategory } from '../../../models/playerchat';
import { embedBasePlayerchat } from '../../../views/playerchat';

export default new CustomButtonBuilder('register-playerchat-category')
	.onGenerate((builder) => builder.setLabel('Register Category'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const currentChannelId = i.channel?.id;
		if (!currentChannelId) throw new InteractionError('You need to be in a channel');
		if (i.channel.type != ChannelType.GuildText) throw new InteractionError('You need to be in a text channel');

		if (!i.channel.parentId) throw new InteractionError('The channel needs to be in a category');

		const playerChatManager = await getPlayerChatManager({ categoryId: i.channel.parentId });
		if (playerChatManager) throw new InteractionError('Cannot register a player chat category, as one already exists in this category');

		const playerChatCategory = await registerPlayerChatCategory({ categoryId: i.channel.parentId });
		if (!playerChatCategory) throw new InteractionError('Failed to register player chat category');

		const payload = embedBasePlayerchat(playerChatCategory);
		return await i.update(payload);
	});
