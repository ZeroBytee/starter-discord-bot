const { SlashCommandBuilder, Message, Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const axios = require('axios');

const configpatch = {
	method: 'patch',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/resetwaarschuwingen',
};

let waarschuwingNr = null;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('waarschuwingen-resetten')
		.setDescription('reset de waarschuwingingen van een collega')
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addStringOption(option =>
			option.setName('naam')
				.setDescription('Naam van de persoon in kwestie')
				.setRequired(true)
				),
		
	async execute(client, interaction) {
		naam = interaction.options.getString('naam');

		const resetwaarschuwingenUrl = configpatch.url + "/" + naam;

		axios.patch(resetwaarschuwingenUrl)
		.then((response) => {
			// user bestaat nog niet
			if (naam != null) {
				// stuur warning
				interaction.reply("Succesvol de waarschuwingen van " + naam + " gereset!");

			} else {
				interaction.reply('Kon waarschuwingingen niet resetten.');
			}

			})
			.catch((error) => {
			  console.log(error);
			})

		
	},
};