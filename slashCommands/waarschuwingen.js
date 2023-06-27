const { SlashCommandBuilder, Message, Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const axios = require('axios');

const configget = {
	method: 'get',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/getwarnings',
};

let waarschuwingNr = null;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('aantal-waarschuwingen')
		.setDescription('Stuurt hoeveel waarschuwingen een collega heeft')
		//.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addStringOption(option =>
			option.setName('naam')
				.setDescription('Naam van de persoon in kwestie')
				.setRequired(true)
		),	
		
	async execute(client, interaction) {
		naam = interaction.options.getString('naam');

		const channel = client.channels.cache.get("1102635307360333914");
		const getWarningUrl = configget.url + "/" + naam;

		axios.request(getWarningUrl)
		.then((response) => {
			// user bestaat nog niet

			waarschuwingNr = parseInt(response.data);

			const exampleEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Waarschuwingen')
				.addFields(
					{ name: 'Naam', value: naam, inline: true  },
					{ name: 'Aantal waarschuwingen', value: waarschuwingNr.toString(), inline: true },
				)
				.setTimestamp()
				.setFooter({ text: 'Waarschuwing systeem VAB'});


			if (naam != null) {
				// stuur warning
				interaction.reply({ embeds: [exampleEmbed] });

			} else {
				interaction.reply('Deze persoon staat niet in het systeem!');
			}


			})
			.catch((error) => {
			  console.log(error);
			})

		
	},
};