export type Servers = 'firemaw' | 'gehennas' | 'mograine' | 'lucifron' | 'golemagg';

type ServerConfig = {
  name: Servers;
  channelId: string;
  roleId: string;
}

export const ROLES = {
  admin: '763739953283727390',
  leader: '763740020296646667',
  everyone: '611155317115584512',
};

export const serverConfig: ServerConfig[] = [
  {
    name: 'firemaw',
    channelId: '763493482961829969',
    roleId: '763488022720151562',
  },
  {
    name: 'gehennas',
    channelId: '763493453190660126',
    roleId: '763488000008519692',
  },
  {
    name: 'mograine',
    channelId: '763493504273088544',
    roleId: '763488051766362122',
  },
  {
    name: 'lucifron',
    channelId: '763493570396028948',
    roleId: '763487967209455616',
  },
  {
    name: 'golemagg',
    channelId: '763772016905682954',
    roleId: '763772706083700777',
  },
];
