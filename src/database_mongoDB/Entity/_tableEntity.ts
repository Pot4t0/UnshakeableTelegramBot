import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

/**
 * Represents the 'events' collection in the database.
 */
@Entity('events')
export class Events {
  /**
   * The unique identifier for the event.
   */
  @ObjectIdColumn()
  id: ObjectId;

  /**
   * The name of the event.
   */
  @Column()
  eventName: string;

  /**
   * The team the event belongs to.
   * @example 'Bday'
   */
  @Column()
  eventTeam: string;

  /**
   * The date of the event.
   * @example '12/12/2021'
   */
  @Column()
  eventDate: string;

  /**
   * Not allowed users for the event.
   * @example '@Pot4t0'
   */
  @Column()
  notAllowedUser: string;
}

/**
 * Represents the 'names' collection in the database.
 */
@Entity('names')
export class Names {
  /**
   * The unique identifier for the user.
   */
  @ObjectIdColumn()
  id: ObjectId;

  /**
   * The full name of the user.
   */
  @Column()
  nameText: string;

  /**
   * The Telegram username of the user.
   */
  @Column()
  teleUser: string;

  /**
   * The lg role of the user.
   * @example ['Admin', 'Finance']
   */
  @Column('simple-array', { nullable: true })
  role: string[];

  /**
   * The chat id of the user.
   * @example 123456789
   */
  @Column()
  chat: string;

  /**
   * The attendance row of the user in the Google Sheet.
   * @example 10
   */
  @Column()
  attendanceRow: number;
}

/**
 * Represents the 'wishes' collection in the database.
 */
@Entity('wishes')
export class Wishes {
  /**
   * The unique identifier for the wish.
   */
  @ObjectIdColumn()
  id: ObjectId;

  /**
   * The name of the event.
   * @example 'Minh's Birthday'
   */
  @Column()
  eventName: string;

  /**
   * The Telegram username of the user.
   * @example '@Pot4t0'
   */
  @Column()
  teleUser: string;

  /**
   * The wish text.
   * @example 'Happy Birthday!'
   */
  @Column()
  wishText: string;
}

/**
 * Represents the 'sf' collection in the database.
 */
@Entity('sf')
export class SF_mongo {
  /**
   * The unique identifier for the user.
   */
  @ObjectIdColumn()
  id: ObjectId;

  /**
   * The Telegram username of the user.
   * @example '@Pot4t0'
   */
  @Column()
  teleUser: string;

  /**
   * The sermon feedback of the user.
   * @example 'The sermon was great!'
   */
  @Column()
  sf: string;

  /**
   * The attendance of the user.
   * @example ['Y']
   */
  @Column('simple-array', { nullable: true })
  attendance: string[];

  /**
   * The reason for the attendance.
   * @example 'Sick'
   */
  @Column()
  timestamp: Date;
}

/**
 * Represents the 'attendance' collection in the database.
 */
@Entity('attendance')
export class Attendance_mongo {
  /**
   * The unique identifier for the Google Sheet.
   */
  @ObjectIdColumn()
  id: ObjectId;

  /**
   * Archive list of the attendance events names.
   * @example '[Minh's Birthday, Christmas Party]'
   */
  @Column('simple-array', { nullable: true })
  archive: string[];

  /**
   * List of the attendance events names.
   * @example '[Minh's Birthday, Christmas Party]'
   */
  @Column('simple-array', { nullable: true })
  eventTitle: string[];

  /**
   * List of the attendance events dates.
   * @example '[12/12/2021, 25/12/2021]'
   */
  @Column('simple-array', { nullable: true })
  eventDate: string[];
}

/**
 * Represents the 'settings' collection in the database.
 */
@Entity('settings')
export class Settings {
  /**
   * The unique identifier for the settings.
   */
  @ObjectIdColumn()
  id: ObjectId;

  /**
   * The option of the settings. (The type of the settings)
   * @example 'gsheet'
   */
  @Column()
  option: string;

  /**
   * The configuration of the settings.
   * @example ['123456789', '123456789', '123456789']
   */
  @Column('simple-array', { nullable: true })
  config: string[];
}
