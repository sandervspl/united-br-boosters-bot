import Discord from 'discord.js';
import AsctiiTable from 'ascii-table';
import { ROLES, serverConfig, Servers } from '../../constants';
import db, { Player } from '../../db';
import Command from '../Command';

export class Amount extends Command {
  constructor(discordClient: Discord.Client) {
    super(discordClient, (msg, trimmedMsg) => {
      const isNumberMsg = !isNaN(Number(trimmedMsg));

      if (
        !isNumberMsg
        && !trimmedMsg.includes('clear')
        && (msg.member?.id && !['298673420181438465', '763721404134588447'].includes(msg.member.id))
      ) {
        msg.delete().then(() => {
          msg.author.createDM().then((dmChannel) => {
            dmChannel.send('Your message was removed because you can only send the amount of boosts in this channel.');
          });
        });
      }

      return isNumberMsg;
    }, {
      channels: serverConfig.map((server) => server.channelId).concat(['763723790407696454', '763749549918912575']),
    });

    this.onCommand((msg) => {
      const amount = Number(msg.content);
      const serverRole = msg.member?.roles.cache.filter((role) => {
        return (
          role.id !== ROLES.admin
          && role.id !== ROLES.leader
          && role.id !== ROLES.everyone
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

        const boostServerValue = db.get('servers')
          .find({ name: boostServerName })
          .value();

        const table = new AsctiiTable();
        table
          .removeBorder()
          .setHeading('Server', '', 'Boost Server', 'Boosted');
        // let resultMsg = `Total ${boostServerName} = ${boostServerValue.total}`;

        let serverFromName: Servers;
        for (serverFromName in boostServerValue.from) {
          const serverFromBoostAmount = boostServerValue.from[serverFromName];

          if (serverFromName == boostServerName) continue;

          // resultMsg += `\n${serverFromName} -> ${boostServerName} = ${serverFrom}`;
          table.addRow(serverFromName, '->', boostServerName, serverFromBoostAmount);
        }

        // msg.channel.send(resultMsg);
        msg.channel.send(`Total ${boostServerName} = ${boostServerValue.total}\n` + '```' + table.toString() + '```');


        // Update player stats
        const playerValue = db.get('players')
          .find({ memberId: msg.member.id })
          .value();

        if (playerValue) {
          db.get('players')
            .find({ memberId: msg.member.id })
            .assign({
              [boostServerName]: playerValue[boostServerName] + amount,
            })
            .write();
        } else {
          const serverAmounts = {} as Record<Servers, number>;
          for (const server of serverConfig) {
            serverAmounts[server.name] = 0;
          }

          serverAmounts[boostServerName] = amount;

          db.get('players')
            .push({
              memberId: msg.member.id,
              name: msg.member.displayName,
              server: playerServerName,
              ...serverAmounts,
            })
            .write();
        }

        // Check if name changed
        if (playerValue && playerValue.name !== msg.member.displayName) {
          db.get('players')
            .find({ memberId: msg.member.id })
            .assign({ name: msg.member.displayName })
            .write();
        }

        // Send message to player showing his total boosts
        msg.member.createDM().then((dmChannel) => {
          const playerValue = db.get('players')
            .find({ memberId: msg.member?.id })
            .value();

          const table = new AsctiiTable()
            .removeBorder()
            .setHeading('Server', '', 'Boost Server', 'Boosted');

          let key: keyof Player;
          for (key in playerValue) {
            if (typeof playerValue[key] === 'number') {
              table.addRow(key, '->', boostServerName, playerValue[key]);
            }
          }

          dmChannel.send('Your current total for the week:\n' + '```' + table.toString() + '```');
        });
      }
    });
  }
}
