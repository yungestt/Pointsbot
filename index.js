const { Client, GatewayIntentBits } = require("discord.js");
const { deployCommands } = require("./deploy-commands");
const fs = require("fs");
const path = require("path");
const { syncDB } = require("./db/database");
require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json());
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  commands.push(command);
}

syncDB().then(() => {
  deployCommands(commands);

  client.login(process.env.TOKEN);

  client.once("ready", () => {
    console.log(`Bot logged in as ${client.user.tag}`);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = commands.find(
      (cmd) => cmd.data.name === interaction.commandName
    );
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  });
});
