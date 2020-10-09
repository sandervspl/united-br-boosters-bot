import low, { AdapterSync } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { serverConfig, Servers } from './constants';

const adapter = new FileSync('db.json');
const db = low<AdapterSync<DB>>(adapter);

type DB = {
  players: Player[];
  servers: Server[];
};

type Player = {
  memberId: string;
} & {
  [server in Servers]: number;
};

type Server = {
  name: Servers;
  total: number;
  from: {
    [server in Servers]: number;
  }
}

db.defaults<DB>({
  players: [],
  servers: serverConfig.map((cfg) => ({
    name: cfg.name,
    total: 0,
    from: {
      firemaw: 0,
      gehennas: 0,
      mograine: 0,
      lucifron: 0,
      golemagg: 0,
    },
  })),
}).write();

export default db;
