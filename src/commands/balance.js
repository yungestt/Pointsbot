const { SlashCommandBuilder } = require("@discordjs/builders");
const { User, ShopItem, UserInventory } = require("../db/models");
const { balance } = require("../config/messagesConfig.json");
const Mustache = require("mustache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(balance.commandName)
    .setDescription(balance.commandDescription)
    .addUserOption((option) =>
      option
        .setName(balance.userName)
        .setDescription(balance.userNameDescription)
        .setRequired(false)
    ),

  async execute(interaction) {
    const user =
      interaction.options.getUser(balance.userName) || interaction.user;

    try {
      const [record, created] = await User.findOrCreate({
        where: { discordId: user.id },
        defaults: { discordId: user.id },
      });

      const userItems = await UserInventory.findAll({
        where: { user_id: user.id },
        include: [
          {
            model: ShopItem,
            attributes: ["name", "id", "role"],
          },
        ],
      });

      const items = userItems
        .map((item) => item?.ShopItem?.dataValues || null)
        .filter((e) => e !== null);
      await interaction.reply(
        Mustache.render(balance.replyText, {
          items,
          record,
          user,
        })
      );
    } catch (error) {
      console.error(error);
      await interaction.reply(balance.errorText);
    }
  },
};
