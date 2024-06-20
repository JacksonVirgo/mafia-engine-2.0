import { SlashCommandBuilder, type ChatInputCommandInteraction, type AutocompleteInteraction } from 'discord.js';
import { Interaction } from './_Interaction';
import registerCitizenship from '../../events/modals/registerCitizenship';
import { getUserById } from '../../models/users';
import { Logger, LogType } from '../../util/logger';

export type SlashCommandContext = {
	logger: Logger;
};

export type SlashCommandExecute = (i: ChatInputCommandInteraction, ctx: SlashCommandContext) => unknown | Promise<unknown>;
const defaultSlashCommandExecute: SlashCommandExecute = async (i, _ctx) => {
	await i.reply({ content: 'This slash command has not been implemented yet.', ephemeral: true });
};

export type SlashCommandAutocomplete = (i: AutocompleteInteraction) => unknown | Promise<unknown>;

export enum CommandServerRestriction {
	// Catch-All
	All = 'all',
	None = 'none',

	// Specific Servers
	DiscordMafia = 'discordmafia',
	PlayerChat = 'playerchat',

	// Public Use
	Org = 'org', // Example
}
export class SlashCommand extends Interaction {
	public static slashCommands = new Map<string, SlashCommand>();
	private builder: SlashCommandBuilder;
	private executeFunction: SlashCommandExecute = defaultSlashCommandExecute;
	private executeAutoComplete: SlashCommandAutocomplete | undefined;
	private requiresCitizenship: boolean = false;
	private restriction: CommandServerRestriction = CommandServerRestriction.None;

	constructor(name: string) {
		super(name);
		if (SlashCommand.slashCommands.has(name)) throw new Error(`Slash command ${name} already exists.`);
		SlashCommand.slashCommands.set(name, this);
		this.builder = new SlashCommandBuilder().setName(name).setDescription('No description provided.');
	}

	public setDescription(description: string) {
		this.builder.setDescription(description);
		return this;
	}

	public setRestriction(restriction: CommandServerRestriction) {
		this.restriction = restriction;
		return this;
	}

	public setRequiresCitizenship(requiresCitizenship: boolean = true) {
		this.requiresCitizenship = requiresCitizenship;
		return this;
	}

	public set(setBuilder: (builder: SlashCommandBuilder) => void) {
		setBuilder(this.builder);
		return this;
	}

	public onExecute(executeFunction: SlashCommandExecute) {
		this.executeFunction = executeFunction;
		return this;
	}

	public onAutoComplete(autocompleteFunction: SlashCommandAutocomplete) {
		this.executeAutoComplete = autocompleteFunction;
		return this;
	}

	public async run(inter: ChatInputCommandInteraction) {
		const logger = new Logger();
		const user = await getUserById(inter.user.id);
		if ((!user || !user.isRegistered) && this.requiresCitizenship) {
			const registerModal = registerCitizenship.getModalBuilder();
			return await inter.showModal(registerModal);
		}

		const ctx: SlashCommandContext = {
			logger,
		};

		try {
			await this.executeFunction(inter, ctx);
		} catch (err) {
			logger.log(LogType.Error, `Failed to run slash command ${this.builder.name}`);
			console.log(err);
			await inter.reply({ content: 'An error occurred while executing this command.', ephemeral: true });
		}
	}

	public async runAutoComplete(i: AutocompleteInteraction) {
		if (!this.executeAutoComplete) return;
		try {
			await this.executeAutoComplete(i);
		} catch (err) {
			await i.respond([]);
		}
	}

	public getBuilder() {
		return this.builder;
	}
}
