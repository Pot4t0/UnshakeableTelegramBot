"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Entry point for the bot application.
 */
const grammy_1 = require("grammy");
const _initialise_1 = require("./functions/_initialise");
const _botOn_functions_1 = require("./functions/_botOn_functions");
const _commands_1 = require("./cmd/_commands");
const _index_1 = require("./functions/_index");
/**
 * Initialise the bot and handle errors if bot is not initialised.
 * @throws {Error} Throws an error if bot is not initialised successfully.
 */
const bot = (0, _initialise_1.init_bot)();
if (!bot) {
    throw new Error('Bot not initialised');
}
/**
 * Initialise bot commands.
 */
(0, _commands_1.commands)(bot);
/**
 * Handle callback queries.
 */
(0, _index_1.callbackQueryHandler)(bot);
/**
 * Handle bot.on method. **(KEEP THIS AT END OF PROGRAM)**
 * This method can completely destroy everything if used wrongly.
 * Refer to switch case in botOn_functions.ts to understand how to differentiate it.
 */
(0, _botOn_functions_1.botOnHandler)(bot);
/**
 * Start the bot (TESTING ONLY).
 * Comment this out when deploying.
 */
// bot.start();
/**
 * Create a webhook callback for the bot using grammY's webhook.
 * @returns {Function} The webhook callback function.
 */
exports.default = (0, grammy_1.webhookCallback)(bot, 'http');
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
