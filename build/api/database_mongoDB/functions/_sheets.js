"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeSheetExecution = exports.chooseSheet = void 0;
const grammy_1 = require("grammy");
const _telefunctions_1 = require("../../app/_telefunctions");
const _db_init_1 = require("../_db-init");
const _tableEntity_1 = require("../Entity/_tableEntity");
const _SessionData_1 = require("../../models/_SessionData");
const chooseSheet = async (bot) => {
    bot.callbackQuery('manageGSheet', _telefunctions_1.loadFunction, sheetMenu);
    bot.callbackQuery(/^changeSheet/g, _telefunctions_1.loadFunction, changeSheet); //Settings Bot On
};
exports.chooseSheet = chooseSheet;
const sheetMenu = async (ctx) => {
    (0, _telefunctions_1.removeInLineButton)(ctx);
    const inlinekeyboard = new grammy_1.InlineKeyboard([
        [
            {
                text: 'Attendance Sheet',
                callback_data: 'changeSheetAttendance',
            },
        ],
        [
            {
                text: 'SF Sheet',
                callback_data: 'changeSheetSF',
            },
        ],
        [
            {
                text: 'Finance Sheet',
                callback_data: 'changeSheetFinance',
            },
        ],
    ]);
    await ctx.reply('Choose Sheet to change to:', {
        reply_markup: inlinekeyboard,
    });
};
const changeSheet = async (ctx) => {
    await (0, _telefunctions_1.removeInLineButton)(ctx);
    const sheetType = ctx.update.callback_query.data.substring('changeSheet'.length);
    ctx.session.text = sheetType;
    await ctx.reply(`Please input the Sheet ID for the ${sheetType} Sheet. DO remember to give the bot permisssions!`, {
        reply_markup: { force_reply: true },
    });
    ctx.session.botOnType = 33;
};
const changeSheetExecution = async (ctx) => {
    const sheetid = ctx.message.text;
    const sheetType = ctx.session.text;
    if (sheetid && sheetType) {
        const sheetArr = await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).findOneBy({
            option: 'gsheet',
        });
        if (!sheetArr) {
            await ctx.reply('ERROR! Did not initialise chat ids for lg');
        }
        else {
            const sheetIDArr = sheetArr.config;
            switch (sheetType) {
                case 'Attendance':
                    sheetIDArr[0] = sheetid.toString();
                    process.env.LG_CHATID = sheetid.toString();
                    break;
                case 'SF':
                    sheetIDArr[1] = sheetid.toString();
                    process.env.LG_CHATID = sheetid.toString();
                    break;
                case 'Finance':
                    sheetIDArr[2] = sheetid.toString();
                    process.env.LG_FINANCE_CLAIM = sheetid.toString();
                    break;
                default:
                    await ctx.reply('ERROR! No Sheet found!');
                    return;
            }
            await _db_init_1.Database.getMongoRepository(_tableEntity_1.Settings).updateOne({ option: 'gsheet' }, { $set: { config: sheetIDArr } });
        }
        await ctx.reply(`${sheetType} Sheet changed to ${sheetid} Remember to add bot to the sheet!`);
    }
    else {
        await ctx.reply('Error! Please try again!');
    }
    ctx.session = (0, _SessionData_1.initial)();
};
exports.changeSheetExecution = changeSheetExecution;
