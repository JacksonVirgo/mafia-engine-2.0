import { ChannelType } from 'discord.js';
import { anonymousGroupExistsInChannel, createAnonymousGroup } from '../../../models/anonymity';
import { CustomButtonBuilder } from '../../../structures/interactions/Button';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { anonEmbedMainPage } from '../../../views/anonymity';

export default new CustomButtonBuilder('manage-anonymity-create')
	.onGenerate((builder) => builder.setLabel('Create Anonymous Group'))
	.onExecute(async (i) => {
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const currentChannelId = i.channel?.id;
		if (!currentChannelId) throw new InteractionError('You need to be in a channel');
		if (i.channel.type != ChannelType.GuildText) throw new InteractionError('You need to be in a text channel');

		const existingGroup = await anonymousGroupExistsInChannel(currentChannelId);
		if (existingGroup) throw new InteractionError('Cannot create an anonymous group, as one already exists in this channel');

		const createdGroup = await createAnonymousGroup(currentChannelId);
		if (!createdGroup) throw new InteractionError('Failed to create the anonymous group');

		const payload = await anonEmbedMainPage(createdGroup);
		return await i.update(payload);
	});
