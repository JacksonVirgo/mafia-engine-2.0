import { prisma } from '../../../..';
import { getVoteCounter } from '../../../../models/votecounter';
import { CustomButtonBuilder } from '../../../../structures/interactions/Button';
import { genTogglesMenu } from '../gotoToggles';

export enum VCSettings {
	LOCK_VOTES = 'lock-votes',
	MAJORITY = 'majority',
	NO_LYNCH = 'nolynch',
}

export default new CustomButtonBuilder('manage-vc-toggle')
	.onGenerate((builder) => builder.setLabel('Home'))
	.onExecute(async (i, cache) => {
		if (!i.guild) return i.reply({ content: 'This command can only be used in a server', ephemeral: true });
		if (!cache) return i.reply({ content: 'An error occured while creating the vote counter [ERR_01]', ephemeral: true });

		const toggleLockVotes = cache === VCSettings.LOCK_VOTES;
		const toggleMajority = cache === VCSettings.MAJORITY;
		const toggleNoLynch = cache === VCSettings.NO_LYNCH;

		if (!toggleLockVotes && !toggleMajority && !toggleNoLynch) return i.reply({ content: 'The button you clicked was invalid [ERR_02]', ephemeral: true });

		const voteCounter = await getVoteCounter({ channelId: i.channelId });
		if (!voteCounter) return i.reply({ content: 'This is not a vote channel', ephemeral: true });

		console.log('OLD', voteCounter);

		const vc = await prisma.voteCounter.update({
			where: {
				id: voteCounter.id,
			},
			data: {
				majority: toggleMajority ? !voteCounter.majority : voteCounter.majority,
				lockVotes: toggleLockVotes ? !voteCounter.lockVotes : voteCounter.lockVotes,
				noLynch: toggleNoLynch ? !voteCounter.noLynch : voteCounter.noLynch,
			},
			include: {
				players: {
					include: {
						user: true,
					},
				},
				votes: {
					include: {
						voter: true,
						votedTarget: true,
					},
				},
			},
		});

		console.log('VC', vc);

		const payload = genTogglesMenu(vc ?? undefined);
		return await i.update(payload);
	});
