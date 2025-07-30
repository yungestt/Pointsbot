const { SlashCommandBuilder } = require("@discordjs/builders");
const { User, ShopItem } = require("../db/models");
const { addItem } = require("../config/messagesConfig.json");
const Mustache = require("mustache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(addItem.commandName)
    .setDescription(addItem.commandDescription)
    .addStringOption((option) =>
      option
        .setName(addItem.itemName)
        .setDescription(addItem.itemNameDescription)
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName(addItem.price)
        .setDescription(addItem.priceDescription)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName(addItem.role)
        .setDescription(addItem.roleDescription)
        .setRequired(false)
    ),

  async execute(interaction) {
    const item = interaction.options.getString(addItem.itemName);
    const price = interaction.options.getInteger(addItem.price);
    const role = interaction.options.getRole(addItem.role);

    if (price < 0) return await interaction.reply(addItem.errorText);
    try {
      ShopItem.create({
        name: item,
        price,
        role: role ? role.id : null,
      });

      await interaction.reply(
        Mustache.render(addItem.replyText, {
          item,
          price,
          role: role ? role.id : null,
        })
      );
    } catch (error) {
      console.error(error);
      await interaction.reply(addItem.errorText);
    }
  },
};
