export type Servers = 'firemaw' | 'gehennas' | 'mograine' | 'lucifron' | 'golemagg';

type ServerConfig = {
  name: Servers;
  channelId: string;
  roleId: string;
}

export const serverConfig: ServerConfig[] = [
  {
    name: 'firemaw',
    channelId: '763723790407696454',
    roleId: '763723661529972737',
  },
  {
    name: 'gehennas',
    channelId: '763749549918912575',
    roleId: '',
  },
  {
    name: 'mograine',
    channelId: '',
    roleId: '',
  },
  {
    name: 'lucifron',
    channelId: '',
    roleId: '',
  },
  {
    name: 'golemagg',
    channelId: '',
    roleId: '',
  },
];
