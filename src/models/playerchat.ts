import { prisma } from '../index';

type ChannelQuery = { categoryId: string };
type SnowflakeQuery = { id: number };
export type PlayerChatManagerQuery = ChannelQuery | SnowflakeQuery;
export type PlayerChatManager = NonNullable<Awaited<ReturnType<typeof getPlayerChatManager>>>;

export async function getPlayerChatManager(query: PlayerChatManagerQuery) {
	return await prisma.playerChatManager
		.findUnique({
			where: query,
			include: {
				playerChats: true,
			},
		})
		.catch(null);
}

type RegisterPlayerChatCategoryQuery = {
	categoryId: string;
};
export async function registerPlayerChatCategory(query: RegisterPlayerChatCategoryQuery): Promise<PlayerChatManager | null> {
	try {
		return await prisma.playerChatManager.create({
			data: {
				categoryId: query.categoryId,
			},
			include: {
				playerChats: true,
			},
		});
	} catch (err) {
		return null;
	}
}
