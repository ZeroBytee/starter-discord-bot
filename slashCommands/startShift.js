const { SlashCommandBuilder, Message, Client, GatewayIntentBits, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
const axios = require('axios');

let waarschuwingNr = null;

const startpatch = {
	method: 'patch',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/startshift',
};
const stoppatch = {
	method: 'patch',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/stopshift',
};

const getdienst = {
	method: 'get',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/getshift',
};

const getdiensttime = {
	method: 'get',
	maxBodyLength: Infinity,
	url: 'http://dono-01.danbot.host:1323/v1/getshifttime',
};

function convertMillisecondsToTime(milliseconds) {
	const seconds = Math.floor((milliseconds / 1000) % 60);
	const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
	const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  
	return `${hours}h ${minutes}m ${seconds}s`;
  }

module.exports = {
	data: new SlashCommandBuilder()
		.setName('dienst')
		.setDescription('start of stop uw VAB shift'),
		
	async execute(client, interaction) {

        await interaction.deferReply({ ephemeral: true });
        
		const interactionUser = await interaction.guild.members.fetch(interaction.user.id);
		const nickName = interactionUser.displayName;
		const userId = interactionUser.id;

		const startDienstUrl = startpatch.url + "/" + nickName;
		const stopDienstUrl = stoppatch.url + "/" + nickName;
		const getDienstUrl = getdienst.url + "/" + nickName;
		const getDienstTijdUrl = getdiensttime.url + "/" + nickName;

		const channel = client.channels.cache.get("1122977368684896308");

		var dienstStatus = null;
		var time = null;
		
		await axios.get(getDienstUrl)
		.then((response) => {
			if (response.data['message'] == "in-dienst") {
				dienstStatus = "in dienst";
			} else {
				dienstStatus = "uit dienst";
			}

			})
			.catch((error) => {
			  console.log(error);
			})
		
		await axios.get(getDienstTijdUrl)
			.then((response) => {
				
				var millis = response.data['user']['totaalTime'];
				time = convertMillisecondsToTime(millis);

				})
				.catch((error) => {
				  console.log(error);
				})
        
		const dienstEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Dienst')
				.addFields(
					{ name: "Totaal tijd:", value: time },
					{ name: "status:", value: dienstStatus },
				)
				.setTimestamp()
				.setFooter({ text: 'Dienst systeem VAB'});

		const inDienstEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('In Dienst Gegaan')
			.addFields(
				{ name: 'Naam', value: nickName },
				{ name: 'Totaal tijd:', value: time },
			)
			.setTimestamp()
			.setFooter({ text: 'Dienst systeem VAB'});

		const uitDienstEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('Uit Dienst Gegaan')
			.addFields(
				{ name: 'Naam', value: nickName },
				{ name: 'Totaal tijd:', value: time },
			)
			.setTimestamp()
			.setFooter({ text: 'Dienst systeem VAB'});
        
        const startButton = new ButtonBuilder()
			.setLabel("in dienst")
			.setStyle(ButtonStyle.Success)
			.setCustomId("start-dienst")
			
		const stopButton = new ButtonBuilder()
			.setLabel("uit dienst")
			.setStyle(ButtonStyle.Danger)
			.setCustomId("stop-dienst")

		const buttonRow = new ActionRowBuilder().addComponents(startButton, stopButton);
        
		const reply = await interaction.editReply({ embeds: [dienstEmbed], components: [buttonRow], ephemeral: true });

		const filter = (i) => i.user.id === userId;

		const collector = reply.createMessageComponentCollector({
			componentType: ComponentType.Button,
			filter,
			time: 20_000,
		});

		collector.on('collect', (interaction) => {
			if (interaction.customId === "start-dienst") {
				interaction.reply({ content:"Je bent in dienst gegaan.", ephemeral: true })
				axios.patch(startDienstUrl).catch((error) => {
			  		console.log(error);
				})
				channel.send({ embeds: [inDienstEmbed] });
			} else if (interaction.customId === "stop-dienst") {
				interaction.reply({ content:"Je bent uit dienst gegaan.", ephemeral: true })
				axios.patch(stopDienstUrl).catch((error) => {
					console.log(error);
			  	})
			  	channel.send({ embeds: [uitDienstEmbed] });
			}
		})

		collector.on('end', () => {
			startButton.setDisabled(true);
			stopButton.setDisabled(true);

			reply.edit({
				components: [buttonRow],
			});
		})



		
	},
};