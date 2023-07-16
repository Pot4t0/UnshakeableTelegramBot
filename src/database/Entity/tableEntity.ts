import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity('eventTable')
export class EventTable {
    @PrimaryGeneratedColumn()
    eventID!: number
    @Column('varchar')
    name!: string 
    @Column('varchar')
    cardMaker: string
    @Column('varchar')
    cardDate: string
	@Column('varchar')
    wishCollector: string
	@Column('varchar')
    wishDate: string
	@Column('varchar')
    giftPerson: string
    @Column('varchar')
    giftDate: string
    @Column('varchar')
    planner: string
    @Column('varchar')
    eventDate: string
}

@Entity('nameTable')
export class NameTable {
    @PrimaryGeneratedColumn()
    nameID: number
    @Column('varchar')
    text: string 
    @Column('varchar')
    callback_data: string
}

@Entity('wishTable')
export class WishTable {
    @PrimaryGeneratedColumn()
    wishID: number
    @Column('varchar')
    eventName: string 
    @Column('varchar')
    name: string
    @Column('varchar')
    wish: string
}