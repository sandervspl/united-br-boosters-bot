import Discord from 'discord.js';
import { ROLES, serverConfig } from '../../constants';
import db from '../../db';
import Command from '../Command';

/**
 * WIP
 */
export class Reset extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, 'reset', {
      prefix: '!',
      channels: serverConfig.map((server) => server.channelId).concat(['763723790407696454', '763749549918912575']),
      roles: [ROLES.admin, ROLES.leader, '763739953283727390', '763740020296646667'],
    });

    this.onCommand((msg) => {
      db.get('players').remove().write();
      // db.get('servers').

      msg.member?.createDM().then((dmChannel) => {
        dmChannel.send('Data for this week has been reset.');
      });
    });
  }
}
