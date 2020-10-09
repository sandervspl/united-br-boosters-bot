import Discord from 'discord.js';
import db from '../../db';
import Command from '../Command';

/**
 * WIP
 */
export class Reset extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, 'reset', {
      prefix: '!',
      channels: ['763723790407696454', '763749549918912575'],
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
