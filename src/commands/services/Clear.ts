import Discord from 'discord.js';
import { serverConfig } from '../../constants';
import Command from '../Command';

export class Clear extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, 'clear', {
      prefix: '!',
      channels: serverConfig.map((server) => server.channelId),
    });

    this.onCommand((msg) => {
      msg.channel.messages.fetch().then((messages) => {
        (msg.channel as Discord.TextChannel).bulkDelete(messages.size - 1);
      });
    });
  }
}
