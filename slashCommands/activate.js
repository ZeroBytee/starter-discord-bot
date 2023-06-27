const { SlashCommandBuilder, Message, Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const axios = require('axios');

const configpost = {
	method: 'patch',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/addwarning',
};

const configget = {
	method: 'get',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/getwarnings',
};

let waarschuwingNr = null;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('waarschuwing')
		.setDescription('Geef een waarschuwing aan een collega')
		//.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
		.addStringOption(option =>
			option.setName('naam')
				.setDescription('Naam van de persoon in kwestie')
				.setRequired(true)
				)
		.addStringOption(option2 =>
			option2.setName('reden')
				.setDescription('reden voor waarschuwing')
				.setRequired(true)
				
				),		
		
	async execute(client, interaction) {
		naam = interaction.options.getString('naam');
		reden = interaction.options.getString('reden');

		const channel = client.channels.cache.get("1102635307360333914");
		const getWarningUrl = configget.url + "/" + naam;

		console.log(getWarningUrl);

		axios.request(getWarningUrl)
		.then((response) => {
			// user bestaat nog niet


			waarschuwingNr = (parseInt(response.data) + 1);
			
			const postWarningUrl = configpost.url + "/" + naam + "/" + waarschuwingNr;
			console.log(postWarningUrl);

			const exampleEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Waarschuwing')
				.addFields(
					{ name: 'Naam', value: naam },
					{ name: 'Reden', value: reden },
					{ name: 'Waarschuwing nr', value: waarschuwingNr.toString(), inline: true },
				)
				.setTimestamp()
				.setFooter({ text: 'Waarschuwing systeem VAB'});


			if (naam != null && reden != null) {
				// stuur warning
				channel.send({ embeds: [exampleEmbed] });
				axios.patch(postWarningUrl).catch((error) => {
			  		console.log(error.data);
				})

			} else {
				interaction.reply('Kon waarschuwing niet sturen');
			}


			})
			.catch((error) => {
			  console.log(error);
			})

		
	},
};