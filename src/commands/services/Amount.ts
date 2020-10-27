import Discord from 'discord.js';
import AsctiiTable from 'ascii-table';
import { flatten as _flatten } from 'lodash';
import { roleIds, serverConfig, Servers } from '../../constants';
import db from '../../db';
import Command from '../Command';

export class Amount extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, async (msg, trimmedMsg) => {
      const isNumberMsg = !isNaN(Number(trimmedMsg));

      if (
        // Not number
        !isNumberMsg
        // Allow clear
        && !trimmedMsg.includes('clear')
        // Allow bot
        && msg.author.id !== process.env.BOT_ID
      ) {
        console.error('(Amount) DELETE triggered');
        console.error({ isNumberMsg, trimmedMsg, author: msg.author });
        // msg.delete();

        if (msg.author.id !== process.env.BOT_ID) {
          // msg.author.send('Your message was removed because you can only send the amount of boosts in this channel.');
        }
      }

      return isNumberMsg;
    }, {
      cooldown: 0,
      channels: _flatten(serverConfig.map((server) => server.channelId)),
    });

    this.onCommand(async (msg) => {
      const amount = Number(msg.content);
      const member = await msg.member?.fetch();

      if (!member) {
        console.error('Error (Amount): Something went wrong fetching member of the message!');
        console.error({ msg });

        this.onError(msg);

        return;
      }

      if (!this.options.channels?.includes(msg.channel.id)) {
        return false;
      }

      const serverRole = member.roles.cache.filter((role) => {
        return roleIds.includes(role.id);
      });

      if (!msg.member?.id || !serverRole) {
        console.error('Error (Amount): No member id or serverRole.');
        console.error({ memberId: msg.member?.id, serverRole: JSON.stringify(serverRole, null, 2) });

        this.onError(msg);

        return false;
      }

      const rolesArray = Array.from(serverRole);
      const playerServerName = rolesArray[0][1].name.toLowerCase() as Servers;

      if (!roleIds.includes(rolesArray[0][1].id)) {
        console.error('Error (Amount): Something went wrong grabbing server role.');
        console.error({ member: msg.member, rolesArray });

        this.onError(msg);

        return false;
      }

      let boostServerName = '' as Servers;
      for (const server of serverConfig) {
        if (server.channelId.includes(msg.channel.id)) {
          boostServerName = server.name.toLowerCase() as Servers;
        }
      }

      if (!boostServerName) {
        console.error('Error (Amount): No boostServerName found.');
        console.error({ boostServerName });

        this.onError(msg);

        return false;
      }


      // Update server total
      const serverValue = db.get('servers')
        .find({ name: boostServerName })
        .value();

      db.get('servers')
        .find({ name: boostServerName })
        .assign({
          total: serverValue.total + amount,
          from: {
            ...serverValue.from,
            [playerServerName]: serverValue.from[playerServerName] + amount,
          },
        })
        .write();

      const boostServerValue = db.get('servers')
        .find({ name: boostServerName })
        .value();


      // Create ASCII table for reply
      const table = new AsctiiTable();
      table
        .removeBorder()
        .setHeading('Server', '', 'Boost Server', 'Boosted');

      let serverFromName: Servers;
      for (serverFromName in boostServerValue.from) {
        serverFromName = serverFromName.toLowerCase() as Servers;
        const serverFromBoostAmount = boostServerValue.from[serverFromName];

        if (serverFromName == boostServerName) continue;

        table.addRow(serverFromName, '->', boostServerName, serverFromBoostAmount);
      }

      msg.channel.send(`Total ${boostServerName} = ${boostServerValue.total}\n` + '```' + table.toString() + '```');


      // Update player stats
      // const playerValue = db.get('players')
      //   .find({ memberId: msg.member.id })
      //   .value();

      // if (playerValue) {
      //   db.get('players')
      //     .find({ memberId: msg.member.id })
      //     .assign({
      //       [boostServerName]: playerValue[boostServerName] + amount,
      //     })
      //     .write();
      // } else {
      //   const serverAmounts = {} as Record<Servers, number>;
      //   for (const server of serverConfig) {
      //     serverAmounts[server.name] = 0;
      //   }

      //   serverAmounts[boostServerName] = amount;

      //   db.get('players')
      //     .push({
      //       memberId: msg.member.id,
      //       name: msg.member.displayName,
      //       server: playerServerName,
      //       ...serverAmounts,
      //     })
      //     .write();
      // }

      // // Check if name changed
      // if (playerValue && playerValue.name !== msg.member.displayName) {
      //   db.get('players')
      //     .find({ memberId: msg.member.id })
      //     .assign({ name: msg.member.displayName })
      //     .write();
      // }
    });
  }
}
