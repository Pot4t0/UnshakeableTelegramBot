import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

/**
 * Represents the 'events' collection in the database.
 */
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

/**
 * Represents the 'names' collection in the database.
 */
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

/**
 * Represents the 'wishes' collection in the database.
 */
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

/**
 * Represents the 'sf' collection in the database.
 */
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

/**
 * Represents the 'attendance' collection in the database.
 */
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

/**
 * Represents the 'settings' collection in the database.
 */
@Entity('settings')
export class Settings {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  option: string;

  @Column('simple-array', { nullable: true })
  config: string[];
}

/**
 * Represents the 'claims' collection in the database.
 */
@Entity('claims')
export class Claims {
  @ObjectIdColumn()
  id: ObjectId;

  @Column()
  name: string;

  @Column()
  claimid: string;

  @Column()
  date: string;

  @Column()
  status: string;

  @Column()
  amount: number;

  @Column()
  description: string;

  @Column()
  msg: string;
}
