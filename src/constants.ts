import { flatten as _flatten } from 'lodash';

export type Servers = 'firemaw' | 'gehennas' | 'mograine' | 'lucifron' | 'golemagg';

type ServerConfig = {
  name: Servers;
  channelId: string[];
  roleId: string[];
}

export const ROLES = {
  admin: '763739953283727390',
  leader: '763740020296646667',
  everyone: '611155317115584512',
};

export const serverConfig: ServerConfig[] = [
  {
    name: 'firemaw',
    // PROD, DEV
    channelId: ['763493482961829969', '763723790407696454'],
    roleId: ['763488022720151562', '763723661529972737'],
  },
  {
    name: 'gehennas',
    // PROD, DEV
    channelId: ['763493453190660126', '763749549918912575'],
    roleId: ['763488000008519692', '764128932042637343'],
  },
  {
    name: 'mograine',
    channelId: ['763493504273088544'],
    roleId: ['763488051766362122'],
  },
  {
    name: 'lucifron',
    channelId: ['763493570396028948'],
    roleId: ['763487967209455616'],
  },
  {
    name: 'golemagg',
    channelId: ['763772016905682954'],
    roleId: ['763772706083700777'],
  },
];

export const roleIds = _flatten(
  serverConfig.map((server) => server).map((server) => server.roleId),
);

export const channelIds = _flatten(
  serverConfig.map((server) => server).map((server) => server.channelId),
);
