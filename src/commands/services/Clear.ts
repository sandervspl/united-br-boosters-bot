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
      msg.channel.messages.fetch().then((messages) => {
        const deletableMessages = messages.filter((msg) => {
          const diff = Math.floor(Date.now() - msg.createdAt.getTime());
          const day = 1000 * 60 * 60 * 24;
          const days = Math.floor(diff / day);

          return msg.deletable
          // Discord only allows bulk delete messages younger than 14 days old
          && days < 14
          && (
            // Remove number messages
            !isNaN(Number(msg.content))
            // Or bot messages
            || msg.author.id === process.env.BOT_ID
          );
        });

        (msg.channel as Discord.TextChannel).bulkDelete(deletableMessages.size + 1);
      });
    });
  }
}
