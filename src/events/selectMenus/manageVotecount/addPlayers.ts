import { type UserSelectMenuInteraction, type CacheType } from 'discord.js';
import { UserSelectMenu } from '../../../structures/interactions/UserSelectMenu';
import { InteractionError } from '../../../structures/interactions/_Interaction';
import { prisma } from '../../..';
import { getOrCreateUser } from '@models/users';
import { getVoteCounter, getPlayer } from '@models/votecounter';
import { genCreateVoteCountEmbed, genPlayersEmbed } from '@views/votecounter';
export default class AddPlayersMenu extends UserSelectMenu {
	static customId = 'manage-vc-select-players-add';
	constructor() {
		super(AddPlayersMenu.customId);
	}

	async onExecute(i: UserSelectMenuInteraction<CacheType>) {
		console.log('AddPlayersMenu.onExecute');
		if (!i.guild) throw new InteractionError('This command can only be used in a server');

		const values = i.values;
		if (!values) throw new InteractionError('No users were provided');

		const vc = await getVoteCounter({ channelId: i.channelId });
		if (!vc) return i.update(genCreateVoteCountEmbed());

		const players = vc.players;

		const existingPlayers: string[] = [];
		const newPlayers: string[] = [];

		for (const value of values) {
			if (players.find((player) => player.discordId === value)) existingPlayers.push(value);
			else newPlayers.push(value);
		}

		if (newPlayers.length <= 0) throw new InteractionError('No new players were provided');

		// Create players

		console.log(existingPlayers, newPlayers);

		const failedPlayers: string[] = [];
		const successfulPlayers: string[] = [];

		for (const newPlayer of newPlayers) {
			try {
				const member = await i.guild.members.fetch(newPlayer);
				if (!member) {
					failedPlayers.push(newPlayer);
					continue;
				}

				const user = await getOrCreateUser(member);
				if (!user) {
					failedPlayers.push(newPlayer);
					continue;
				}

				const player = await getPlayer(vc.id, member.id);
				if (player) {
					failedPlayers.push(newPlayer);
					continue;
				}

				await prisma.player.create({
					data: {
						discordId: member.id,
						voteCounterId: vc.id,
					},
				});

				successfulPlayers.push(newPlayer);
			} catch (error) {
				console.error(error);
			}
		}

		const newVC = await getVoteCounter({ channelId: i.channelId });
		if (!newVC) return i.update(genCreateVoteCountEmbed());
		const playerMenuPayload = genPlayersEmbed(newVC);
		await i.update(playerMenuPayload);
	}

	generateUserSelectMenu() {
		return super.generateUserSelectMenu().setMaxValues(25).setMinValues(1).setPlaceholder('Players to add to the vote counter');
	}
}
