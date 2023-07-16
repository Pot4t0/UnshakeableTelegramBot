import "reflect-metadata"


import { DataSource } from "typeorm"
import { EventTable, NameTable, WishTable } from './Entity/tableEntity';

export const Database = new DataSource({
    type: "mariadb",
    host: 'pi',
    port: 3306,
    username: 'user',
    password: process.env.PASSWORD ||"",
    database: 'unshakeableDB',
    entities: [EventTable, NameTable, WishTable]
})

const init = async() => {
    await Database.initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err)
    })
}
 init()