import { Bot, InlineKeyboard, SessionFlavor,Context, session } from "grammy";
import { query } from "./database/query";

const token = '6311860288:AAExnXXlX0a7ZYBs40YUqUdPzRSWgX4sVzc';
// Create an instance of the `Bot` class and pass your bot token to it.
interface SessionData {
	eventName ?: string;
	name ?: string;
	wish ?: string;
}
type MyContext = Context & SessionFlavor<SessionData>;
const bot = new Bot<MyContext>(token); // <-- put your bot token between the ""

function initial(): SessionData {
	return {
		eventName : undefined,
		name : undefined,
		wish : undefined
	};
}

bot.use(session({ initial }));

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => ctx.reply("UNSHAKEABLE WELFARE! :D"));
// Handle other messages.


bot.command("sendwish", async (ctx) => {
	const events = await query.select("eventTable", "name");
	const inlineKeyboard = new InlineKeyboard(
		events.map(event => [{
			text:event,
			callback_data:`eventName-${event}`
		}]))
		
	await ctx.reply("Current upcoming event: ", {
		reply_markup : inlineKeyboard
	}
	
)});

bot.callbackQuery(/^eventName-/g, async (ctx) => {
	const event = ctx.update.callback_query.data.substring('eventName-'.length);
	ctx.session.eventName = event
	const names = await query.select("nameTable", "text");
	const inlineKeyboard = new InlineKeyboard(
		names.map(n => [{
			text:n,
			callback_data:`name-${n}`
	}]))
	await ctx.answerCallbackQuery({
		text: event,
	});
	await ctx.reply ("Name: ", {
		reply_markup : inlineKeyboard
	})
})

bot.callbackQuery(/^name-/g, async (ctx) => {
	const name = ctx.update.callback_query.data.substring('name-'.length);
	ctx.session.name = name

	await ctx.answerCallbackQuery({
		text: name,
	});
	await ctx.reply ("Wish: ", {
		reply_markup :  {
			force_reply: true
		}
	})
})

bot.on("message", async (ctx) => {

	if (ctx.session.eventName && ctx.session.name) {
		try {
		const wish = ctx.message.text||''
		ctx.session.wish = wish
		const eventName = ctx.session.eventName
		const name = ctx.session.name
		const wishSent = await query.insert("wishTable", ['eventName','name', 'wish'], [eventName,name,wish]);
		ctx.reply("Wish Received");
		ctx.session = initial();
		} catch (err) {
			console.log (err)
		}
	}

})


// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start();