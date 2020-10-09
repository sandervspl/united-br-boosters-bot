import Discord from 'discord.js';
import AsctiiTable from 'ascii-table';
import { serverConfig, Servers } from '../../constants';
import db from '../../db';
import Command from '../Command';

export class Amount extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, (msg, trimmedMsg) => {
      const isNumberMsg = !isNaN(Number(trimmedMsg));

      if (!isNumberMsg && !trimmedMsg.includes('clear')) {
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
      const amount = Number(msg.content);
      const serverRole = msg.member?.roles.cache.filter((role) => {
        return (
          // admin
          role.id !== '763739953283727390'
          // leader
          && role.id !== '763740020296646667'
          // @everyone
          && role.id !== '611155317115584512'
        );
      });

      if (msg.member?.id && serverRole) {
        const rolesArray = Array.from(serverRole);
        const playerServerName = rolesArray[0][1].name as Servers;

        let boostServerName = '' as Servers;
        for (const server of serverConfig) {
          if (msg.channel.id === server.channelId) {
            boostServerName = server.name;
          }
        }

        if (!boostServerName) {
          console.error('No boostServerName found');
          return;
        }

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

        // const member = db.get('players').find({ memberId: msg.member.id }).value();

        // if (member) {
        //   db.get('players')
        // } else {
        //   const defaultValues = {
        //     memberId: msg.member.id,
        //     firemaw: 0,
        //     gehennas: 0,
        //     golemagg: 0,
        //     lucifron: 0,
        //     mograine: 0,
        //   };

        //   defaultValues[boostServerName] += Number(amount);

        //   db.get('players')
        //     .push()
        //     .write();

        //   const serverValue = db.get('servers').find({ name: boostServerName }).value();

        //   db.get('servers')
        //     .find({ name: boostServerName })
        //     .assign({
        //       total: serverValue.total + amount,
        //     })
        //     .write();
        // }

        const boostServerValue = db.get('servers')
          .find({ name: boostServerName })
          .value();

        const table = new AsctiiTable(`Total ${boostServerName} = ${boostServerValue.total}`);
        table
          .removeBorder()
          .setHeading('Server', 'Boost Server', 'Boosted Characters');
        // let resultMsg = `Total ${boostServerName} = ${boostServerValue.total}`;

        let serverFromName: Servers;
        for (serverFromName in boostServerValue.from) {
          const serverFromBoostAmount = boostServerValue.from[serverFromName];

          // resultMsg += `\n${serverFromName} -> ${boostServerName} = ${serverFrom}`;
          table.addRow(serverFromName, boostServerName, serverFromBoostAmount);
        }

        // msg.channel.send(resultMsg);
        msg.channel.send('```' + table.toString() + '```');
      }
    });
  }
}
