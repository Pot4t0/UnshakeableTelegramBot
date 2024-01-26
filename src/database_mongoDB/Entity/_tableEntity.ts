import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

//Declaring all collections within UnshakeableDB
//events Collection
@Entity('events')
export class Events {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  eventName: string;
  @Column()
  eventTeam: string;
  @Column()
  eventDate: string;
  @Column('simple-json')
  assignment: [
    {
      assignmentName: string;
      teleUser: string;
      date: string;
    },
  ];
  @Column()
  notAllowedUser: string;
}

// names collection
@Entity('names')
export class Names {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  nameText: string;
  @Column()
  teleUser: string;
  @Column('simple-array', { nullable: true })
  role: string[];
  @Column()
  chat: string;
  @Column()
  attendanceRow: number;
}

// wishes Collaction
@Entity('wishes')
export class Wishes {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  eventName: string;
  @Column()
  teleUser: string;
  @Column()
  wishText: string;
}

@Entity('sf')
export class SF_mongo {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  teleUser: string;
  @Column()
  sf: string;
  @Column('simple-array', { nullable: true })
  attendance: string[];
  @Column()
  timestamp: Date;
}

@Entity('attendance')
export class Attendance_mongo {
  @ObjectIdColumn()
  id: ObjectId;
  @Column('simple-array', { nullable: true })
  archive: string[];
  @Column('simple-array', { nullable: true })
  eventTitle: string[];
  @Column('simple-array', { nullable: true })
  eventDate: string[];
}

// Settings Collection
@Entity('settings')
export class Settings {
  @ObjectIdColumn()
  id: ObjectId;
  @Column()
  option: string;
  @Column('simple-array', { nullable: true })
  config: string[];
}

// attendance collection
// @Entity('attendance')
// export class Attendance {
//   @ObjectIdColumn()
//   id: ObjectId;
//   @Column()
//   rowNo: number;
//   @Column()
//   name: string;
// }
