import Discord from 'discord.js';
import { ROLES, channelIds } from '../../constants';
import Command from '../Command';

export class Clear extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, 'clear', {
      prefix: '!',
      channels: channelIds,
      roles: [ROLES.admin, ROLES.leader, ROLES.dev.admin, ROLES.dev.leader],
    });

    this.onCommand((msg) => {
      console.log('!clear command');
      console.log({ msg });

      msg.channel.messages.fetch().then((messages) => {
        console.log({ messages });
        (msg.channel as Discord.TextChannel).bulkDelete(messages.size - 1);
      });
    });
  }
}
