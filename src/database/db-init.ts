import {createPool} from 'mariadb';

// Expose the Pool object within this module
export default createPool({
    host: 'pi',
    port: 3306,
    user: 'user',
    password: 'Password123!',
    database: 'unshakeableDB',
  })
