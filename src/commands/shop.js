const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { ShopItem } = require("../db/models");
const { shop } = require("../config/messagesConfig.json");
const Mustache = require("mustache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(shop.commandName)
    .setDescription(shop.commandDescription),

  async execute(interaction) {
    const PAGE_SIZE = shop.itemsOnPage;
    let currentPage = 1;

    // Генерация страницы магазина
    async function generateShopPage(page) {
      const offset = (page - 1) * PAGE_SIZE;
      const items = await ShopItem.findAll({
        order: [["id", "ASC"]],
        limit: PAGE_SIZE,
        offset: offset,
      });

      if (!items.length) {
        return null;
      }

      const shopEntries = Mustache.render(shop.itemsList, { items });

      const embed = new EmbedBuilder()
        .setTitle(shop.title)
        .setDescription(shopEntries)
        .setColor(shop.color)
        .setFooter({ text: Mustache.render(shop.footer, { page }) });

      return embed;
    }

    async function hasNextPage(page) {
      const offset = page * PAGE_SIZE;
      const items = await ShopItem.findAll({
        limit: 1,
        offset: offset,
      });
      return items.length > 0;
    }

    // Создание кнопок пагинации
    function createButtons(page, nextPageExists) {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("previous")
          .setLabel("⬅️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId("next")
          .setLabel("➡️")
          .setStyle(ButtonStyle.Primary)
          .setDisabled(!nextPageExists)
      );
    }

    await interaction.deferReply();

    const initialEmbed = await generateShopPage(currentPage);

    if (!initialEmbed) {
      await interaction.editReply(shop.noContent);
      return;
    }

    const nextPageExists = await hasNextPage(currentPage);

    const message = await interaction.editReply({
      embeds: [initialEmbed],
      components: [createButtons(currentPage, nextPageExists)],
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      try {
        if (i.customId === "previous") {
          currentPage = Math.max(currentPage - 1, 1);
        } else if (i.customId === "next") {
          currentPage++;
        }

        const success = await updateShop(i, currentPage);
        if (!success) collector.stop();
      } catch (error) {
        console.error("Error while updating interaction:", error);
        collector.stop();
      }
    });

    collector.on("end", async () => {
      try {
        await interaction.editReply({
          components: [],
        });
      } catch (error) {
        console.error("Error editing reply after collector ended:", error);
      }
    });

    async function updateShop(interaction, page) {
      const shopEmbed = await generateShopPage(page);

      if (!shopEmbed) {
        await interaction.update({
          content: shop.noContent,
          embeds: [],
          components: [],
        });
        return false;
      }

      const nextPageExists = await hasNextPage(page);

      await interaction.update({
        embeds: [shopEmbed],
        components: [createButtons(page, nextPageExists)],
      });

      return true;
    }
  },
};
