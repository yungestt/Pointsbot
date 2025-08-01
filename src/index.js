const { Client, GatewayIntentBits } = require("discord.js");
const { deployCommands } = require("./deploy-commands");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Запускаем Express-сервер (Replit ping)
const express = require("express");
const app = express();
const port = 3000;

app.get("/", (_, res) => {
  res.send("Hello, World!");
});
app.listen(port, () => {
  console.log(`Web server running on port ${port}`);
});

// Запускаем бота
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command);
}

deployCommands(commands);

client.once("ready", () => {
  console.log(`✅ Bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.find(cmd => cmd.data.name === interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error("❌ Ошибка при выполнении команды:", error);
    await interaction.reply({
      content: "❗ Произошла ошибка при выполнении команды.",
      ephemeral: true,
    });
  }
});

client.login(process.env.TOKEN);