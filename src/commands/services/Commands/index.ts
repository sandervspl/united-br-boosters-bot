import Discord from 'discord.js';
import commands from '..';
import Command from 'commands/Command';

export class Commands extends Command {
  public readonly excludedCommands = ['ping', 'marco', 'commands'];
  public readonly commandNames = commands
    .map((cmd) => cmd.name.toLowerCase())
    .filter((cmd) => !this.excludedCommands.includes(cmd));

  constructor(discordClient: Discord.Client) {
    super(discordClient, 'commands');

    this.onCommand((msg) => {
      msg.channel.send(`Available commands: ${this.commandNames.join(', ')}`);
    });
  }
}
