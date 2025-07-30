const { SlashCommandBuilder } = require('@discordjs/builders');
const { User } = require('../db/database');
const { t } = require('../locale');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pay')
		.setDescription('Передать поинты другому участнику')
		.setDescriptionLocalizations({
			en: 'Transfer points to another user',
		})
		.addUserOption(option =>
			option.setName('пользователь')
				.setNameLocalizations({ en: 'user' })
				.setDescription('Кому вы хотите передать поинты')
				.setDescriptionLocalizations({
					en: 'The user to transfer points to',
				})
				.setRequired(true),
		)
		.addIntegerOption(option =>
			option.setName('количество')
				.setNameLocalizations({ en: 'amount' })
				.setDescription('Сколько поинтов передать')
				.setDescriptionLocalizations({
					en: 'Amount of points to transfer',
				})
				.setRequired(true),
		),

	async execute(interaction) {
		const locale = interaction.locale.startsWith('ru') ? 'ru' : 'en';

		const senderId = interaction.user.id;
		const recipient = interaction.options.getUser('пользователь') || interaction.options.getUser('user');
		const amount = interaction.options.getInteger('количество') || interaction.options.getInteger('amount');

		if (recipient.bot) {
			return interaction.reply({ content: t(locale, 'error_bot'), ephemeral: true });
		}

		if (recipient.id === senderId) {
			return interaction.reply({ content: t(locale, 'error_self'), ephemeral: true });
		}

		if (amount <= 0) {
			return interaction.reply({ content: t(locale, 'error_amount'), ephemeral: true });
		}

		let sender = await User.findByPk(senderId);
		if (!sender) sender = await User.create({ discordId: senderId, points: 0 });

		if (sender.points < amount) {
			return interaction.reply({ content: t(locale, 'error_balance'), ephemeral: true });
		}

		let receiver = await User.findByPk(recipient.id);
		if (!receiver) receiver = await User.create({ discordId: recipient.id, points: 0 });

		sender.points -= amount;
		receiver.points += amount;

		await sender.save();
		await receiver.save();

		return interaction.reply({
			content: t(locale, 'success', amount, recipient.id),
			ephemeral: false,
		});
	},
};