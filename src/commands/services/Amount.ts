import Discord from 'discord.js';
import Command from '../Command';

export class Amount extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, (msg) => {
      return !isNaN(Number(msg))
    });

    this.onCommand((msg) => {
      msg.reply('That\'s a number!');
    });
  }
}
