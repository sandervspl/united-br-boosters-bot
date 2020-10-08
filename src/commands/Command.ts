import Discord from 'discord.js';
import moment from 'moment';
import _ from 'lodash';
import { O } from 'ts-toolbelt';
import env from 'helpers/env';
import { Options, CommandCallback } from './types';

export default abstract class Command {
  private cooldowns = new Discord.Collection();
  private readonly options: O.Required<Options, 'cooldown'> = {
    cooldown: 3000,
  };

  constructor(
    protected readonly client: Discord.Client,
    public readonly listen: string | ((msg: Discord.Message, trimmedMsg: string) => boolean),
    options?: Options,
  ) {
    this.options = {
      ...this.options,
      ...options,
    };
  }


  protected onCommand = (cb: CommandCallback) => this.client.on('message', async (msg) => {
    if (env.isDevelopment && !this.isFromDeveloper(msg)) {
      return;
    }

    if (
      env.isProduction
      && (
        // Testing channel
        msg.channel.id === '561859968681115658'
        // Test suite channel
        || msg.channel.id === '611163871398592521'
      )
    ) {
      return;
    }

    // Clean up message
    const content = msg.content
      .toLowerCase()
      .trim();

    let message = content;

    // Check if message starts with the command prefix
    if (this.options.prefix) {
      if (!msg.content.startsWith(this.options.prefix)) {
        return;
      }

      // Remove prefix
      message = content.slice(1);
    }

    // Check if the message we received is the same as what we listen to
    let match = false;

    if (typeof this.listen === 'function') {
      match = this.listen(msg, message);
    }

    if (typeof this.listen == 'string') {
      match = message.startsWith(this.listen);
    }

    if (match) {
      const hasRole = await this.hasRequiredRole(msg);

      if (!hasRole) {
        return;
      }

      if (this.cooldowns.has(this.listen)) {
        return;
      }

      cb(msg, this.getArgs(msg.content));

      this.startCooldown();
    }
  });

  protected isFromDeveloper = (msg: Discord.Message): boolean => {
    return msg.author.id === '77783102469967872';
  }

  protected getArgs = (content: string): string[] => {
    return content.split(' ').slice(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected onError = (msg: Discord.Message, err: any) => {
    msg.channel.send('😅 You broke the bot.');

    console.error(`Error '${this.listen}':`, err);
  }


  private hasRequiredRole = async (msg: Discord.Message): Promise<boolean> => {
    if (this.options.roles && msg.guild) {
      const member = await msg.guild.members.fetch(msg.author.id);

      if (!member) {
        return false;
      }

      const memberRoles = member.roles.cache.map((role) => role.name.toLowerCase());
      const hasRequiredRole = _.intersection(this.options.roles, memberRoles).length > 0;

      return hasRequiredRole;
    }

    return true;
  }

  private startCooldown = (): void => {
    const now = moment();

    this.cooldowns.set(this.listen, now);

    setTimeout(() => this.cooldowns.delete(this.listen), this.options.cooldown);
  }
}
