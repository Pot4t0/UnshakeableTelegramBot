import { CommandContext, InlineKeyboard } from "grammy";
import { BotContext } from "../app";
import { Database } from "../database/db-init";
import { EventTable } from "../database/Entity/tableEntity";

export const start =  async(ctx:CommandContext<BotContext>) => {
	await ctx.reply("Welcome to UnShakeable Welfare Telegram Bot")
}
export const help =  async(ctx:CommandContext<BotContext>) => {
	await ctx.reply(`
	Help List
	/sendwish -->  Send wishes to upcoming welfare events
	/admin --> Management of resources/data within this telegram bot (FOR WELFARE TEAM ONLY)
	`)

}
export const settings =  async(ctx:CommandContext<BotContext>) => {
	await ctx.reply("Settings (in development)")
}

export const sendWish = async (ctx: CommandContext<BotContext>) => {
	const events = await Database.getRepository(EventTable).find()
	// query.select("eventTable", "name");
	const inlineKeyboard = new InlineKeyboard(
		events.map(event => [{
			text:event.name,
			callback_data:`eventName-${event.name}`
		}]
		)
	)
		
	await ctx.reply("Choose upcoming Welfare Event ", {
		reply_markup : inlineKeyboard
	}

	
)};
export const admin =  async(ctx:CommandContext<BotContext>) => {
	const inlineKeyboard = new InlineKeyboard(
		[
		[
		{
			"text" : "Mangement of Wish Database Table",
			"callback_data" : "wishManagement"
		}
		],[
		{
			"text": "Management of Unshakeable Members (in development)",
			"callback_data" : "nameManagement"
		}
		],[
		{
			"text": "Management of Welfare Events(in development)",
			"callback_data" : "eventManagement"
		}
		],[
		{
			"text": "Management of Welfare Financial Matters(in development)",
			"callback_data" : "financeManagement"
		}
		]
		]
	);

	await ctx.reply(`
	Welfare Team Admin Matters
	
	Pls take not that this is still experimental as such many functions may not work 100%. If there are any issues pls feedback to developer (Minh). He will OTOT settle it
	`
	, {
		reply_markup : inlineKeyboard
	}
)}
