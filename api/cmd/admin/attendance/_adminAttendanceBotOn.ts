import { Filter } from 'grammy';
import { BotContext } from '../../../app/_index';
import { initial } from '../../../models/_SessionData';
import {
  adminAttendanceBotOn,
  createEventDBDoc,
} from './__adminAttendanceInternal';
import { gsheet } from '../../../functions/_initialise';

// LG Event Worship Experience Date
// Used in _botOn_functions.ts in botOntype = 21
export const addAttendanceSheet_LGEventWEDateMessage = async (
  ctx: Filter<BotContext, 'message'>
) => {
  ctx.session.botOnType = await undefined;
  ctx.session.eventDate = await ctx.message.text;
  if (ctx.session.eventDate == null) {
    addAttendanceSheet_LGEventWEDateMessage(ctx);
  }
  await ctx.reply('Enter LG Date in dd/mm/yyyy: ', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = adminAttendanceBotOn.createLgEventBotOn;
};
// Create LG Event Sheet
// Used in _botOn_functions.ts in botOntype = 22
export const addAttendanceSheet_CreateLGEventSheet = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const lgDate = await ctx.message.text;
  if (lgDate == null) {
    addAttendanceSheet_CreateLGEventSheet(ctx);
  }
  const weDate = ctx.session.eventDate;
  if (lgDate && weDate) {
    ctx.session.botOnType = await undefined;
    const lgDateArray = lgDate.split('/');
    const weDateArray = (await ctx.session.eventDate?.split('/')) || '';
    const unshakeableAttendanceSpreadsheet = await gsheet('attendance');
    const templateSheet = unshakeableAttendanceSpreadsheet.sheetsById[0];
    const sheetExist =
      unshakeableAttendanceSpreadsheet.sheetsByTitle[
        `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
      ];

    if (sheetExist == undefined) {
      await templateSheet.duplicate({
        title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
      });
      const newSheet =
        unshakeableAttendanceSpreadsheet.sheetsByTitle[
          `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
        ];
      await newSheet.loadCells();
      const lgDateCell = newSheet.getCellByA1(`F2`);
      const weDateCell = newSheet.getCellByA1(`C2`);
      weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
      lgDateCell.value = `${lgDateArray[0]}/${lgDateArray[1]}/${lgDateArray[2]}`;
      await newSheet.saveUpdatedCells();
      const title = `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
      await ctx.reply(`${title} sheet has been created`);
      await createEventDBDoc(title, weDate);
    } else {
      await ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
    }
    ctx.session = initial();
    unshakeableAttendanceSpreadsheet.resetLocalCache();
  }
};
// Create No LG Event Sheet
// Used in _botOn_functions.ts in botOntype = 23
export const addAttendanceSheet_CreateNoLGEventSheet = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const weDate = ctx.message.text;
  if (weDate == null) {
    addAttendanceSheet_CreateNoLGEventSheet(ctx);
  }
  if (weDate) {
    ctx.session.botOnType = undefined;
    const weDateArray = weDate.split('/');
    ctx.session = initial();
    const unshakeableAttendanceSpreadsheet = await gsheet('attendance');
    const templateSheet = unshakeableAttendanceSpreadsheet.sheetsById[0];
    const sheetExist =
      unshakeableAttendanceSpreadsheet.sheetsByTitle[
        `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
      ];

    if (sheetExist == undefined) {
      await templateSheet.duplicate({
        title: `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`,
      });
      const newSheet =
        unshakeableAttendanceSpreadsheet.sheetsByTitle[
          `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`
        ];
      await newSheet.loadCells();
      const lgCell = newSheet.getCellByA1(`F3`);
      const lgReasonCell = newSheet.getCellByA1(`G3`);
      const weDateCell = newSheet.getCellByA1(`C2`);
      weDateCell.value = `${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
      lgCell.value = 'No LG';
      lgReasonCell.value = '';
      await newSheet.saveUpdatedCells();
      const title = `WE: ${weDateArray[0]}/${weDateArray[1]}/${weDateArray[2]}`;
      await ctx.reply(`${title} sheet has been created`);
      await createEventDBDoc(title, weDate);
    } else {
      await ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
    }
    unshakeableAttendanceSpreadsheet.resetLocalCache();
  }
};
// Special Event Date
// Used in _botOn_functions.ts in botOntype = 24
export const addAttendanceSheet_SpecialEventDateMessage = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const specialEvntName = await ctx.message.text;
  if (specialEvntName == null) {
    addAttendanceSheet_SpecialEventDateMessage(ctx);
  }
  ctx.session.eventName = specialEvntName;
  await ctx.reply('Enter Special Event Date in dd/mm/yyyy:', {
    reply_markup: { force_reply: true },
  });
  ctx.session.botOnType = adminAttendanceBotOn.createSplEventBotOn;
};
// Create Special Event Sheet
// Used in _botOn_functions.ts in botOntype = 25
export const addAttendanceSheet_CreateSpecialEventSheet = async (
  ctx: Filter<BotContext, 'message'>
) => {
  const event_date = await ctx.message.text;
  if (event_date == null) {
    addAttendanceSheet_CreateSpecialEventSheet(ctx);
  }
  const event_name = ctx.session.eventName;
  ctx.session.botOnType = undefined;
  const unshakeableAttendanceSpreadsheet = await gsheet('attendance');
  unshakeableAttendanceSpreadsheet.loadInfo();
  const templateSheet =
    unshakeableAttendanceSpreadsheet.sheetsByTitle['Special Event Template'];
  const sheetExist =
    unshakeableAttendanceSpreadsheet.sheetsByTitle[
      `${event_name} (${event_date}) created`
    ];

  if (sheetExist == undefined) {
    await templateSheet.duplicate({
      title: `${event_name} (${event_date})`,
    });
    const newSheet =
      unshakeableAttendanceSpreadsheet.sheetsByTitle[
        `${event_name} (${event_date})`
      ];
    await newSheet.loadCells();
    const eventDateCell = newSheet.getCellByA1('C2');
    const eventNameCell = newSheet.getCellByA1('C3');

    const meal = ctx.session.eventMeal;
    if (meal != 'NM') {
      const mealCell = newSheet.getCellByA1('F3');
      const mealReasonCell = newSheet.getCellByA1('G3');
      mealCell.value = meal;
      mealReasonCell.value = 'Reason';
    }
    if (event_date && event_name) {
      eventDateCell.value = event_date;
      eventNameCell.value = event_name;
      await newSheet.saveUpdatedCells();
      const title = `${event_name} (${event_date})`;
      await createEventDBDoc(title, event_date);
      await ctx.reply(`${title} sheet has been created`);
    } else {
      await ctx.reply(`Error during creation! Please try again!`);
    }
  } else {
    await ctx.reply(`Sheet Already Exists!\nPlease delete if needed`);
  }
  ctx.session = initial();
  unshakeableAttendanceSpreadsheet.resetLocalCache();
};
