"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const _initialise_1 = require("./functions/_initialise");
const _botOn_functions_1 = require("./functions/_botOn_functions");
const _commands_1 = require("./cmd/_commands");
const _index_1 = require("./functions/_index");
const automatedhandler_1 = require("./functions/automatedhandler");
//Initialise Bot as bot
const bot = (0, _initialise_1.init_bot)();
if (!bot) {
    throw new Error('Bot not initialised');
}
//Automated Handler
(0, automatedhandler_1.automated)(bot);
// Command Functions
//Initialise Bot Commands
(0, _commands_1.commands)(bot);
// CallBackQuery Function
(0, _index_1.callbackQueryHandler)(bot);
// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
(0, _botOn_functions_1.botOnHandler)(bot); //Refer to switch case in botOn_functions.ts to understand how to differentiate it.
// Start the bot (TESTING ONLY)
// Comment this out when deploying
bot.start();
//grammY webhook http (Vercel)
exports.default = (0, grammy_1.webhookCallback)(bot, 'http');
//Vercel Edge Runtime
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
