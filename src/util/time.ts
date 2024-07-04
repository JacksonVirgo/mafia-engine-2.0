export function convertDiscordTimestamp(discordTimestamp: number): string {
	const date = new Date(discordTimestamp * 1000);
	const options: Intl.DateTimeFormatOptions = {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
		timeZone: 'UTC',
		timeZoneName: 'short',
	};

	const formattedTime = date.toLocaleString('en-US', options);

	const dayAgo = 1000 * 60 * 60 * 24;
	const dayInFuture = Date.now() + dayAgo;

	if (date.getTime() > dayInFuture) {
		const dateOptions: Intl.DateTimeFormatOptions = {
			month: '2-digit',
			day: '2-digit',
			timeZone: 'UTC',
		};
		const formattedDate = date.toLocaleDateString('en-US', dateOptions);
		return `${formattedTime} on ${formattedDate}`;
	}

	return formattedTime;
}
