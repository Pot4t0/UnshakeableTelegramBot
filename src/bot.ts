import { Context, webhookCallback } from 'grammy';
import { init_bot } from './functions/_initialise';
import { botOnHandler } from './functions/_botOn_functions';
import { commands } from './cmd/_commands';
import { callbackQueryHandler } from './functions/_index';

//Initialise Bot as bot
const bot = init_bot();
if (!bot) {
  throw new Error('Bot not initialised');
}

// Command Functions
//Initialise Bot Commands
commands(bot);

// CallBackQuery Function
callbackQueryHandler(bot);

// Bot.on method **(KEEP THIS AT END OF PROGRAM)**
// THIS METHOD CAN COMPLETELY DESTROY EVERYTHING IF USED WRONGLY
botOnHandler(bot); //Refer to switch case in botOn_functions.ts to understand how to differentiate it.

// Start the bot (TESTING ONLY)
// Comment this out when deploying
bot.start();

//grammY webhook http (Vercel)
export default webhookCallback(bot, 'http');
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
