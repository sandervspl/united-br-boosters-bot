import Discord from 'discord.js';
import { serverConfig, ROLES } from '../../constants';
import Command from '../Command';

export class Clear extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, 'clear', {
      prefix: '!',
      channels: serverConfig.map((server) => server.channelId).concat(['763723790407696454', '763749549918912575']),
      roles: [ROLES.admin, ROLES.leader],
    });

    this.onCommand((msg) => {
      msg.channel.messages.fetch().then((messages) => {
        (msg.channel as Discord.TextChannel).bulkDelete(messages.size - 1);
      });
    });
  }
}
