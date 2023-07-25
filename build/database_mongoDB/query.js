"use strict";
// import db from './db-init';
// class Query {
//   select = async  (table:string, column:string|string[]) => {
//     let list:string[] = [];
//     try {
//       // Use pool.query to get all contacts
//       let rows = await db.query('SELECT ' + column + ' FROM ' + table);
//       // Print list of contacts
//       for (let i = 0, len = rows.length; i < len; i++) {
//         list[i] = rows[i][column];
//       }
//     } catch (err) {
//       // Print errors
//       console.log(err);
//     }
//     return list;
//   }
//   /**
//    *
//    * @param {string} table
//    * @param {string[]} valueHeader
//    * @param {string[]} value
//    * @returns {Promise<bigint>} sequence number
//    */
//   insert = (table:string, valueHeader:string[], value:string[]) => {
//     return db.query(`INSERT INTO ${table} (${valueHeader.join(
//       ','
//     )}) VALUES ("${value.join('","')}")`);
//   }
// }
// export const query= new Query()
