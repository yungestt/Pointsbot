const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function deployCommands(commands) {
  const body = commands.map(cmd => cmd.data.toJSON());

  try {
    console.log("🔄 Регистрируем команды...");

    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body }
    );

    console.log("✅ Команды зарегистрированы!");
  } catch (error) {
    console.error("❌ Ошибка при регистрации команд:", error);
  }
}

module.exports = { deployCommands };