const { SlashCommandBuilder } = require("@discordjs/builders");
const { User, ShopItem, UserInventory } = require("../db/models");
const { buy } = require("../config/messagesConfig.json");
const Mustache = require("mustache");
const { sequelize } = require("../db/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(buy.commandName)
    .setDescription(buy.commandDescription)
    .addIntegerOption((option) =>
      option
        .setName(buy.idName)
        .setDescription(buy.idDescription)
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const id = interaction.options.getInteger(buy.idName);

    try {
      const item = await ShopItem.findByPk(id);
      const [userRecord, userCreated] = await User.findOrCreate({
        where: { discordId: interaction.user.id },
        defaults: { discordId: interaction.user.id },
      });
      if (!item)
        return await interaction.editReply({
          content: buy.itemNotFound,
          ephemeral: true,
        });
      if (item.price > userRecord.points)
        return await interaction.editReply(
          Mustache.render(buy.notEnoughMoney, {
            pointsDifference: item.price - userRecord.points,
          })
        );

      const inventoryItem = await UserInventory.findOne({
        where: { userId: interaction.user.id, itemId: item.id },
      });
      if (inventoryItem)
        return await interaction.editReply(buy.alreadyHaveItem);

      const transaction = await sequelize.transaction();

      userRecord.points -= item.price;
      await userRecord.save({ transaction });

      await UserInventory.create(
        {
          userId: interaction.user.id,
          itemId: item.id,
        },
        { transaction }
      );
      transaction.commit();

      const role = interaction.guild.roles.cache.get(item.role);
      if (!role) {
        return await interaction.editReply({
          content: "Роль не найдена!",
          ephemeral: true,
        });
      }

      await interaction.member.roles.add(role);

      await interaction.editReply(
        Mustache.render(buy.replyText, { item, user: userRecord })
      );
    } catch (error) {
      console.error(error);
    }
  },
};
