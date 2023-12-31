import { CustomError } from '../../../util/errors';
import { getVoteCounter } from '@models/votecounter';
import { genCreateVoteCountEmbed, genVoteCountEmbed } from '@views/votecounter';
import { SlashCommand } from '@structures/interactions/SlashCommand';

export default new SlashCommand('manage-votecount').setDescription('Commands surrounding vote counts').onExecute(async (i) => {
	if (!i.guild) return;

	try {
		const vc = (await getVoteCounter({ channelId: i.channelId })) ?? undefined;
		if (!vc) return i.reply({ ...genCreateVoteCountEmbed(), ephemeral: true });
		const payload = genVoteCountEmbed(vc);
		return i.reply({ ...payload, ephemeral: true });
	} catch (err) {
		if (err instanceof CustomError) await err.respond(i).catch((err) => console.log(err));
		else if (i.isRepliable()) return i.reply({ content: 'An unknown error occurred', ephemeral: true }).catch((err) => console.log(err));
		else console.log(err);
	}
});
