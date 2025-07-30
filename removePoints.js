const { SlashCommandBuilder } = require("@discordjs/builders");
const { User } = require("../db/models");
const { removePoints } = require("../config/messagesConfig.json");
const Mustache = require("mustache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(removePoints.commandName)
    .setDescription(removePoints.commandDescription)
    .addUserOption((option) =>
      option
        .setName(removePoints.userOption)
        .setDescription(removePoints.userOptionDescription)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName(removePoints.pointsOption)
        .setDescription(removePoints.pointsOptionDescription)
        .setRequired(true)
    ),
  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const points = interaction.options.getInteger("points");

    if (points < 0)
      return await interaction.reply(
        removePoints.errorPointsCountLowerThanZero
      );

    try {
      const [record, created] = await User.findOrCreate({
        where: { discordId: user.id },
        defaults: { discordId: user.id, points },
      });

      if (!created) {
        if (record.points <= 0) {
          record.points = 0;
          await interaction.reply(
            Mustache.render(removePoints.userAlreadyHaveZeroPoints, { user })
          );
        } else {
          record.points -= points;
          if (record.points < 0) record.points = 0;
          await interaction.reply(
            Mustache.render(removePoints.replyText, {
              user: user,
              pointsRemoved: points,
              points: record.points,
            })
          );
        }
        await record.save();
      } else {
        await interaction.reply(
          Mustache.render(removePoints.userAlreadyHaveZeroPoints, { user })
        );
      }
    } catch (error) {
      console.error(error);
      await interaction.reply(removePoints.errorText);
    }
  },
};
