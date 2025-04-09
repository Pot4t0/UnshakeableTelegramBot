/**
 * Entry point for the bot application.
 */
import { webhookCallback } from 'grammy';
import { init_bot } from './functions/_initialise';
import { botOnHandler } from './functions/_botOn_functions';
import { commands } from './cmd/_commands';
import { callbackQueryHandler } from './functions/_index';

/**
 * Initialise the bot and handle errors if bot is not initialised.
 * @throws {Error} Throws an error if bot is not initialised successfully.
 */
const bot = init_bot();
if (!bot) {
  throw new Error('Bot not initialised');
}

/**
 * Initialise bot commands.
 */
commands(bot);

/**
 * Handle callback queries.
 */
callbackQueryHandler(bot);

/**
 * Handle bot.on method. **(KEEP THIS AT END OF PROGRAM)**
 * This method can completely destroy everything if used wrongly.
 * Refer to switch case in botOn_functions.ts to understand how to differentiate it.
 */
botOnHandler(bot);

/**
 * Start the bot (TESTING ONLY).
 * Comment this out when deploying.
 */
bot.start();

/**
 * Create a webhook callback for the bot using grammY's webhook.
 * @returns {Function} The webhook callback function.
 */
// export default webhookCallback(bot, 'http');

// Vercel Edge Runtime
// export const config = {
//   runtime: 'edge',
// };

// export default async function handler(request: Request) {
//   const urlParams = new URL(request.url).searchParams;
//   const query = Object.fromEntries(urlParams);
//   const cookies = request.headers.get('cookie');
//   let body;
//   try {
//     body = await request.json();
//   } catch (e) {
//     body = null;
//   }

//   return new Response(
//     JSON.stringify({
//       body,
//       query,
//       cookies,
//     }),
//     {
//       status: 200,
//       headers: {
//         'content-type': 'application/json',
//       },
//     }
//   );
// }
