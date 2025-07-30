const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { User } = require("../db/models"); // Убедитесь, что путь к модели корректный
const { leaderboard } = require("../config/messagesConfig.json");
const Mustache = require("mustache");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(leaderboard.commandName)
    .setDescription(leaderboard.commandDescription),

  async execute(interaction) {
    const PAGE_SIZE = leaderboard.usersOnPage; // Количество записей на странице
    let currentPage = 1;

    async function generateLeaderboardPage(page) {
      const offset = (page - 1) * PAGE_SIZE;
      const users = await User.findAll({
        order: [["points", "DESC"]],
        limit: PAGE_SIZE,
        offset: offset,
      });

      if (!users.length) {
        return null;
      }

      const leaderboardEntries = await Promise.all(
        users.map(async (user, index) => {
          try {
            const discordUser = await interaction.client.users.fetch(
              user.discordId
            );
            return `\`${offset + index + 1}.\` **<@${user.discordId}>** — ${
              user.points
            } поинтов`;
          } catch {
            return `\`${offset + index + 1}.\` **Неизвестный пользователь** — ${
              user.points
            } поинтов`;
          }
        })
      );

      const embed = new EmbedBuilder()
        .setTitle(leaderboard.title)
        .setDescription(leaderboardEntries.join("\n"))
        .setColor(leaderboard.color)
        .setFooter({ text: Mustache.render(leaderboard.footer, { page }) });

      return embed;
    }

    async function hasNextPage(page) {
      const offset = page * PAGE_SIZE;
      const users = await User.findAll({
        limit: 1,
        offset: offset,
      });
      return users.length > 0;
    }

    async function updateLeaderboard(interaction, page) {
      const leaderboardEmbed = await generateLeaderboardPage(page);

      if (!leaderboardEmbed) {
        await interaction.update({
          content: leaderboard.noContent,
          embeds: [],
          components: [],
        });
        return false;
      }

      const nextPageExists = await hasNextPage(page);

      await interaction.update({
        embeds: [leaderboardEmbed],
        components: [createButtons(page, nextPageExists)],
      });

      return true;
    }

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

    const initialEmbed = await generateLeaderboardPage(currentPage);

    if (!initialEmbed) {
      await interaction.reply("Нет данных для отображения в лидерборде.");
      return;
    }

    const nextPageExists = await hasNextPage(currentPage);

    const message = await interaction.reply({
      embeds: [initialEmbed],
      components: [createButtons(currentPage, nextPageExists)],
      fetchReply: true,
    });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async (i) => {
      if (i.customId === "previous") {
        currentPage = Math.max(currentPage - 1, 1);
      } else if (i.customId === "next") {
        currentPage++;
      }

      const success = await updateLeaderboard(i, currentPage);
      if (!success) collector.stop();
    });

    collector.on("end", async () => {
      await interaction.editReply({ components: [] });
    });
  },
};

