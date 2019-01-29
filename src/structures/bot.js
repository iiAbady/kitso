const { version } = require('../../package.json') //eslint-disable-line 
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
exports.library = {
	version,
	node: process.version
};
exports.emojis = {
	closedEyes: '<:kitsoOwO:539847502866808843>',
	shocked: '<:kitsoShocked:539848639225266176>',
	thumbsUp1: '<:kitsoThumbsUp:539850864714579978>',
	thumbsUp2: '<:kitsoThumbsUp2:539848759492739076>'
};
