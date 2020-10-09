import Discord from 'discord.js';
import Command from '../Command';

export class Clear extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, 'clear', {
      prefix: '!',
      channels: ['763723790407696454', '763749549918912575'],
    });

    this.onCommand((msg) => {
      msg.channel.messages.fetch().then((messages) => {
        (msg.channel as Discord.TextChannel).bulkDelete(messages.size - 1);
      });
    });
  }
}
