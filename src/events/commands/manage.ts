import { PermissionFlagsBits, ChannelType } from 'discord.js';
import { getAnonymousGroup } from '../../models/anonymity';
import { getVoteCounter } from '../../models/votecounter';
import { SlashCommand } from '../../structures/interactions/SlashCommand';
import { CustomError } from '../../util/errors';
import { anonEmbedMainPage, embedCreateAnonymousGroup } from '../../views/anonymity';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '../../views/votecounter';
import { getPlayerChatManager } from '../../models/playerchat';
import { embedBasePlayerchat, embedRegisterPlayerchat } from '../../views/playerchat';

enum Subcommand {
	VoteCount = 'votecount',
	Autolocker = 'autolocker',
	Anonymity = 'anonymity',
	PlayerChat = 'playerchat',
}

export default new SlashCommand('manage')
	.setDescription('Manage an part of the bot')
	.set((cmd) => {
		cmd.addSubcommand((sub) => sub.setName(Subcommand.VoteCount).setDescription('Manage the votecounter in this channel'));
		cmd.addSubcommand((sub) => sub.setName(Subcommand.Autolocker).setDescription('Manage the autolocker in this channel'));
		cmd.addSubcommand((sub) => sub.setName(Subcommand.Anonymity).setDescription('Manage the anonymity in this channel'));
		cmd.addSubcommand((sub) => sub.setName(Subcommand.PlayerChat).setDescription('Manage the playerchat in this channel'));
		cmd.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);
	})
	.onExecute(async (i) => {
		if (!i.guild) return;
		const subcommand = i.options.getSubcommand(true);

		// if (subcommand == Subcommand.PlayerChat && i.guildId != config.PLAYERCHAT_SERVER_ID)
		// 	return i.reply({
		// 		content: 'You can only use this command in the playerchat server',
		// 		ephemeral: true,
		// 	});
		// else if (subcommand != Subcommand.PlayerChat && i.guildId == config.PLAYERCHAT_SERVER_ID)
		// 	return i.reply({
		// 		content: 'You can only use this command in the main server',
		// 		ephemeral: true,
		// 	});

		const channel = await i.guild.channels.fetch(i.channelId);
		if (!channel || channel.type != ChannelType.GuildText)
			return i.reply({
				content: 'This channel is not a text channel OR this channel is not recognized by the bot',
				ephemeral: true,
			});

		const canManageChannel = channel.permissionsFor(i.user.id)?.has('ManageChannels');
		if (!canManageChannel)
			return i.reply({
				content: 'You do not have the required permissions in this channel to use this command',
				ephemeral: true,
			});

		try {
			switch (subcommand) {
				case 'votecount': {
					const vc = (await getVoteCounter({ channelId: i.channelId })) ?? undefined;
					if (!vc) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
					const payload = genVoteCountEmbed(vc);
					return i.reply({ ...payload, ephemeral: true });
				}

				case 'autolocker':
					return i.reply({
						content: 'Autolocker',
						ephemeral: true,
					});

				case 'anonymity': {
					const group = await getAnonymousGroup(i.channelId);
					const payload = group ? await anonEmbedMainPage(group) : embedCreateAnonymousGroup();
					return await i.reply({ ...payload, ephemeral: true });
				}
				case 'playerchat': {
					if (!channel.parentId) return i.reply({ content: 'This channel is not in a category', ephemeral: true });
					const playerChat = await getPlayerChatManager({ categoryId: channel.parentId });
					const payload = playerChat ? embedBasePlayerchat(playerChat) : embedRegisterPlayerchat();
					return i.reply({
						...payload,
						ephemeral: true,
					});
				}
				default:
					return i.reply({
						content: 'Unknown subcommand',
						ephemeral: true,
					});
			}
		} catch (err) {
			console.log(err);

			if (err instanceof CustomError) await err.respond(i).catch((err) => console.log(err));
			else if (i.isRepliable()) return i.reply({ content: 'An unknown error occurred', ephemeral: true }).catch((err) => console.log(err));
			else console.log(err);
		}
	});
