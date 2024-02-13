"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeChatExecution = exports.chooseChat = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../app/_telefunctions");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
const chooseChat = async (bot, grp) => {
    bot.callbackQuery(`changeChat${grp}`, _telefunctions_1.loadFunction, async (ctx) => {
        await changeChat(ctx, grp);
    }); //Settings Bot On
};
exports.chooseChat = chooseChat;
const changeChat = async (ctx, grp) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const button = new grammy_1.Keyboard()
        .requestChat(`Choose ${grp} Chat`, 1)
        .oneTime(true);
    ctx.session.text = grp;
    await ctx.reply(`Choose the updated ${grp} Chat. It will let the Bot enter the chat and send messages.
	  `, {
        reply_markup: button,
    });
};
const changeChatExecution = async (ctx) => {
    var _a;
    const chatid = (_a = ctx.update.message) === null || _a === void 0 ? void 0 : _a.chat_shared.chat_id;
    const grp = ctx.session.text;
    if (chatid && grp) {
        const lgDetailsArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'LG',
        });
        if (!lgDetailsArr) {
            await ctx.reply('ERROR! Did not initialise chat ids for lg');
        }
        else {
            const lgDetails = lgDetailsArr.config;
            switch (grp) {
                case 'LG':
                    lgDetails[0] = chatid.toString();
                    process.env.LG_CHATID = chatid.toString();
                    break;
                case 'Finance':
                    lgDetails[1] = chatid.toString();
                    process.env.LG_FINANCE_CLAIM = chatid.toString();
                    break;
                default:
                    await ctx.reply('ERROR! No grp found!');
                    return;
            }
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'LG' }, { $set: { config: lgDetails } });
        }
        await ctx.reply(`LG Chat changed to ${chatid} Remember to add bot to the chat!`);
    }
    else {
        await ctx.reply('Error! Please try again!');
    }
};
exports.changeChatExecution = changeChatExecution;
