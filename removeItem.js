const { SlashCommandBuilder } = require("@discordjs/builders");
const { User, ShopItem } = require("../db/models");
const { removeItem } = require("../config/messagesConfig.json");
const Mustache = require("mustache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(removeItem.commandName)
    .setDescription(removeItem.commandDescription)
    .addIntegerOption((option) =>
      option
        .setName(removeItem.idName)
        .setDescription(removeItem.idDescription)
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const id = interaction.options.getInteger(removeItem.idName);
    try {
      await ShopItem.destroy({
        where: { id },
        force: true,
      });

      await interaction.editReply(removeItem.replyText);
    } catch (error) {
      console.error(error);
      await interaction.editReply(removeItem.errorText);
    }
  },
};
