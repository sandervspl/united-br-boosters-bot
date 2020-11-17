import low, { AdapterSync } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { SERVERS } from './constants';


export function resetDB() {
  const servers = (process.env.SERVERS || SERVERS).split(',');

  for (const server of servers) {
    const dbServer = db.get('servers')
      .find({ name: server })
      .value();

    const from = {} as Record<string, number>;

    for (const fromServer of servers) {
      from[fromServer] = 0;
    }

    const val = {
      name: server,
      total: 0,
      from,
    };

    if (dbServer) {
      db.get('servers')
        .find({ name: server })
        .assign(val)
        .write();
    } else {
      db.get('servers')
        .push(val)
        .write();
    }
  }
}

const adapter = new FileSync('db.json');
const db = low<AdapterSync<DB>>(adapter);

type DB = {
  servers: Server[];
};

type Server = {
  name: string;
  total: number;
  from: Record<string, number>;
}

db.defaults<DB>({
  servers: [],
}).write();

// Fill up servers table
resetDB();

export default db;
