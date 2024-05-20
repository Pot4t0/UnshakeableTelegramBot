"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeChatExecution = exports.chooseChat = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../app/_telefunctions");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
/**
 * Sets up callback query handlers for choosing a chat associated with a specific group.
 * This function registers callback queries for changing the chat associated with either the LG or Finance group.
 * @param bot The Bot instance.
 * @param grp The group parameter, which can be either 'LG' or 'Finance'.
 */
const chooseChat = async (bot, grp
// | 'Finance'
) => {
    bot.callbackQuery(`changeChat${grp}`, _telefunctions_1.loadFunction, async (ctx) => {
        await changeChat(ctx, grp);
    });
};
exports.chooseChat = chooseChat;
/**
 * Handles the logic for changing the chat associated with a specific group.
 * This function displays a keyboard for selecting a chat when a user clicks on a callback button.
 * @param ctx The callback query context.
 * @param grp The group parameter, which can be either 'LG' or 'Finance'.
 */
const changeChat = async (ctx, grp
// | 'Finance'
) => {
    // Remove any existing inline buttons
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    // Create a keyboard with a request to choose the chat
    const button = new grammy_1.Keyboard()
        .requestChat(`Choose ${grp} Chat`, 1)
        .oneTime(true);
    // Store the group parameter in the session data
    ctx.session.text = grp;
    // Send a message prompting the user to choose a chat
    await ctx.reply(`Choose the updated ${grp} Chat. It will let the Bot enter the chat and send messages.`, {
        reply_markup: button,
    });
};
/**
 * Executes the chat change process after a chat is selected.
 * This function updates the database with the new chat ID and notifies the user about the change.
 * @param ctx The filter for chat shared events.
 */
const changeChatExecution = async (ctx) => {
    var _a;
    const chatid = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat_shared.chat_id;
    const grp = ctx.session.text;
    if (chatid && grp) {
        // Retrieve chat details from the database
        const lgDetailsArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'LG',
        });
        if (!lgDetailsArr) {
            // Handle error if chat details are not found in the database
            await ctx.reply('ERROR! Did not initialise chat ids for lg');
        }
        else {
            // Extract chat details and update the appropriate chat ID based on the group
            const lgDetails = lgDetailsArr.config;
            switch (grp) {
                case 'LG':
                    lgDetails[0] = chatid.toString();
                    process.env.LG_CHATID = chatid.toString();
                    break;
                // case 'Finance':
                //   lgDetails[1] = chatid.toString();
                //   process.env.LG_FINANCE_CLAIM = chatid.toString();
                //   break;
                default:
                    await ctx.reply('ERROR! No grp found!');
                    return;
            }
            // Update the database with the new chat details
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'LG' }, { $set: { config: lgDetails } });
        }
        // Notify the user about the successful chat change
        await ctx.reply(`LG Chat changed to ${chatid} Remember to add bot to the chat!`);
    }
    else {
        // Handle error if chat ID or group parameter is missing
        await ctx.reply('Error! Please try again!');
    }
};
exports.changeChatExecution = changeChatExecution;
