import Discord from 'discord.js';
import Command from '../Command';

export class Amount extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, (msg, trimmedMsg) => {
      const isNumberMsg = !isNaN(Number(trimmedMsg));

      if (!isNumberMsg) {
        msg.delete().then(() => {
          msg.author.createDM().then((dmChannel) => {
            dmChannel.send('Your message was removed because you can only send the amount of boosts in this channel.');
          });
        });
      }

      return isNumberMsg;
    }, {
      channels: ['763723790407696454', '763749549918912575'],
    });

    this.onCommand((msg) => {
      msg.reply('That\'s a number!');
    });
  }
}
