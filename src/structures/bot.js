const { version } = require('../../package.json') //eslint-disable-line 
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
exports.library = {
	version,
	node: process.version
};
exports.staff = ['171259176029257728', '244423000802328576', '354716386716811264'];
exports.emojis = {
	error: '<:error:485577688245993473>',
	ok: '<:megThumbs:475427359898599441>',
	grayWrong: '<:megWrong:476545382617186337>',
	grayYes: '<:megCorrect:476545535348834324>'
};
exports.channels = {
	error: '474245438837620736',
	logs: '475028391473709068'
};
exports.tokens = {
	bot: process.env.TOKEN
};
