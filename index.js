const { Client, GatewayIntentBits, Routes, Collection, SlashCommandBuilder, } = require("discord.js");
const config = require("./config.json");
const fs = require("node:fs");
const path = require("node:path");
const { REST } = require("@discordjs/rest");

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();
const slashCommands = [];

client.once("ready", () => {
    console.log("Bot Hazır!")

    let guildId = config.guildID
    let clientId = config.clientID
    let token = config.token



    const rest = new REST({version: '10'}).setToken(token);

    rest.put(Routes.applicationGuildCommands(clientId, guildId), {body: slashCommands})
        .then(data => console.log(`Başarıyla Kayıt Olundu ${data.length} application Commands`))
        .catch(console.error);



})

const commandsPath = path.join(__dirname, 'slashCommands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());


    console.log(`${command.data.name} dosyası yüklendi!`)
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(client, interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true});
    }

});

client.login(config.token);