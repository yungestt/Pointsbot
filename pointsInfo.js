const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs"); // Импорт модуля fs
const path = require("path");
const { pointInfo } = require("../config/messagesConfig.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName(pointInfo.commandName)
    .setDescription(pointInfo.commandDescription),

  async execute(interaction) {
    try {
      const filePath = path.join(__dirname, "../config/pointsInfoText.md"); // Укажите путь к вашему MD-файлу
      fs.readFile(filePath, "utf8", (err, data) => {
        if (err) {
          console.error("Ошибка чтения файла:", err);
          return interaction.reply("Не удалось прочитать файл.");
        }

        interaction.reply(data);
      });
    } catch (error) {
      console.error("Error sending pointsinfo message:", error);
      await interaction.reply(
        "An error occurred while retrieving the points information."
      );
    }
  },
};
