const {Client, GatewayIntentBits, Routes, Collection, REST, ActivityType } = require('discord.js');
const config = require("./config.json");
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

const fs = require("node:fs");
const path = require("node:path");

client.commands = new Collection();
const slashCommands = [];

client.once("ready", () => {
    console.log(` ${client.user.username} is online! `)

	client.user.setActivity('HasseltRP | VAB Management', { type: ActivityType.Playing });
    
    let guildId = config.guildId;
    let clientId = config.clientId;
    let token = config.token;

    const rest = new REST({version: 10}).setToken(token);
    rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: slashCommands })
	.then(data => console.log(`Successfully registered ${data.length} application commands.`))
	.catch(console.error);
});

const commandsPath = path.join(__dirname, "slashCommands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	
	client.commands.set(command.data.name, command);
    slashCommands.push(command.data.toJSON());
    console.log(` + | ${command.data.toJSON()} loaded succesfully`)
}



client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});


client.login(config.token);