"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const _initialise_1 = require("./functions/_initialise");
const _botOn_functions_1 = require("./functions/_botOn_functions");
const _commands_1 = require("./cmd/_commands");
const _index_1 = require("./functions/_index");
//Initialise Bot as bot
const bot = (0, _initialise_1.init_bot)();
if (!bot) {
    throw new Error('Bot not initialised');
}
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
exports.default = (0, grammy_1.webhookCallback)(bot, 'http', (ctx, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield next();
    }
    catch (error) {
        console.error('Webhook Error:', error);
        // Send an error message to the user
        const errorMessage = 'An error occurred while processing your request. Please try again later.';
        yield ctx.reply(errorMessage);
    }
}));
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
