import { prisma } from '..';

export async function anonymousGroupExistsInChannel(channelId: string) {
	const group = await prisma.anonymousGroup
		.findFirst({
			where: {
				linkedChannels: {
					has: channelId,
				},
			},
		})
		.catch(null);

	return !!group;
}

export async function createAnonymousGroup(channelId: string) {
	const group = await prisma.anonymousGroup
		.create({
			data: {
				linkedChannels: [channelId],
			},
		})
		.catch(null);

	return group;
}

export type AnonymousGroup = NonNullable<Awaited<ReturnType<typeof getAnonymousGroup>>>;
export async function getAnonymousGroup(channelId: string) {
	const group = await prisma.anonymousGroup
		.findFirst({
			where: {
				linkedChannels: {
					has: channelId,
				},
			},
		})
		.catch(null);

	return group;
}

export async function getAnonymousGroupById(groupId: number): Promise<AnonymousGroup | null> {
	const group = await prisma.anonymousGroup
		.findUnique({
			where: {
				id: groupId,
			},
		})
		.catch(null);
	return group;
}

export async function linkChannelToGroup(groupID: number, channelId: string) {
	const update = await prisma.anonymousGroup
		.update({
			where: {
				id: groupID,
			},
			data: {
				linkedChannels: {
					push: channelId,
				},
			},
		})
		.catch(null);

	return update;
}

export async function unlinkChannelFromGroup(groupID: number, channelId: string) {
	const group = await getAnonymousGroup(channelId);
	if (!group) return null;

	const update = await prisma.anonymousGroup
		.update({
			where: {
				id: group.id,
			},
			data: {
				linkedChannels: {
					set: group.linkedChannels.filter((v) => v != channelId),
				},
			},
		})
		.catch(null);

	return update;
}

export type AnonymousProfiles = NonNullable<Awaited<ReturnType<typeof getAnonymousProfiles>>>;
type ArrayElementType<T> = T extends (infer U)[] ? U : never;
export type AnonymousProfile = ArrayElementType<AnonymousProfiles>;

export async function getAnonymousProfiles(groupId: number) {
	const profiles = await prisma.anonymousProfile
		.findMany({
			where: {
				group: {
					id: groupId,
				},
			},
		})
		.catch(null);

	return profiles;
}

export async function getAnonymousProfile(profileId: number) {
	const profile = await prisma.anonymousProfile
		.findUnique({
			where: {
				id: profileId,
			},
		})
		.catch(null);

	return profile;
}

type CreateProfileData = {
	name: string;
	avatar: string;
	discordId: string;
};
export async function createAnonymousProfile(groupId: number, options: Partial<CreateProfileData> = {}) {
	const group = await getAnonymousGroupById(groupId);
	if (!group) return null;

	const profile = await prisma.anonymousProfile
		.create({
			data: {
				anonymousGroupId: group.id,
				name: options.name,
				avatarURI: options.avatar,
				discordId: options.discordId,
			},
		})
		.catch(null);

	return profile;
}

export async function updateAnonymousProfile(profileID: number, payload: Partial<CreateProfileData>) {
	const updated = await prisma.anonymousProfile
		.update({
			where: {
				id: profileID,
			},
			data: {
				name: payload.name,
				avatarURI: payload.avatar,
				discordId: payload.discordId,
			},
		})
		.catch(null);
	return updated;
}

export async function deleteManyAnonymousProfiles(profileIDs: number[]) {
	const deletions: DeletedProfile[] = [];

	for (const profileID of profileIDs) {
		const deletion = await deleteAnonymousProfile(profileID);
		if (deletion) deletions.push(deletion);
	}

	return deletions;
}

export type DeletedProfile = NonNullable<Awaited<ReturnType<typeof deleteAnonymousProfile>>>;
export async function deleteAnonymousProfile(id: number) {
	const deletion = await prisma.anonymousProfile
		.delete({
			where: {
				id,
			},
		})
		.catch(null);

	return deletion;
}
