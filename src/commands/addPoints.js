const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../db/models');
const { t } = require('../locale');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addpoints')
    .setDescription('Выдать поинты пользователю')
    .setDescriptionLocalizations({
      'en-US': 'Give points to a user',
      'ru': 'Выдать поинты пользователю',
    })
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('Кому вы хотите выдать поинты')
        .setDescriptionLocalizations({
          'en-US': 'The user to give points to',
          'ru': 'Кому вы хотите выдать поинты',
        })
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Сколько поинтов выдать')
        .setDescriptionLocalizations({
          'en-US': 'Amount of points to give',
          'ru': 'Сколько поинтов выдать',
        })
        .setRequired(true)
    ),

  async execute(interaction) {
    const locale = interaction.locale.startsWith('ru') ? 'ru' : 'en';
    const user = interaction.options.getUser('user');
    const points = interaction.options.getInteger('amount');

    if (points < 0) {
      return await interaction.reply({ content: t(locale, 'addpoints_error_negative'), ephemeral: true });
    }

    try {
      const [record, created] = await User.findOrCreate({
        where: { discordId: user.id },
        defaults: { discordId: user.id, points },
      });

      if (!created) {
        record.points += points;
        await record.save();
      }

      await interaction.reply({
        content: t(locale, 'addpoints_success', points, user.id, record.points),
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: t(locale, 'addpoints_error_unknown'), ephemeral: true });
    }
  },
};