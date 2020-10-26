import Discord from 'discord.js';

export class WelcomeService {
  constructor(
    private discordClient: Discord.Client,
  ) {
    this.discordClient.on('guildMemberAdd', this.callback);
  }

  private async callback(member: Discord.GuildMember | Discord.PartialGuildMember) {
    const channel = await member.createDM();

    // eslint-disable-next-line max-len
    await channel.send('Hi there! Welcome to the United Bracket Boosters Discord! I would like to give you your server role. What server are you from? Please answer with: Firemaw, Gehennas, Golemagg, Mograine or Lucifron.');

    function promptServerName() {
      const serverNames = ['firemaw', 'gehennas', 'golemagg', 'mograine', 'lucifron'];

      channel.awaitMessages((msg) => msg.author.id === member.id, {
        max: 1,
      })
        .then((messages) => {
          const msg = messages.first()?.content.toLowerCase();

          if (msg && serverNames.includes(msg)) {
            const role = member.guild.roles.cache.find((role) => role.name.toLowerCase() === msg);

            if (role) {
              member.roles.add(role);

              channel.send('Thank you. Your role has been added. Happy boosting!');
            }
          } else {
            // eslint-disable-next-line max-len
            channel.send('Sorry, I did not recognize the server name. Please make sure there is no typo. You can copy one of these servers: Firemaw, Gehennas, Golemagg, Mograine or Lucifron.');
            promptServerName();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    promptServerName();
  }
}
