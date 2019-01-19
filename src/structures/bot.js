const { version } = require('../../package.json') //eslint-disable-line 
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
exports.library = {
	version,
	node: process.version
};
exports.owner = '171259176029257728';
exports.emojis = {
	error: '<:error:485577688245993473>',
	hmph: '<>'
};
exports.channels = {
	error: '474245438837620736',
	logs: '475028391473709068'
};
