/* eslint-disable new-cap */
module.exports = (sequelize, DataTypes) =>
	sequelize.define('settings', {
		guild: {
			type: DataTypes.STRING(25),
			primaryKey: true,
			allowNull: false
		},
		settings: {
			type: DataTypes.JSONB,
			defaultValue: {}
		}
	}, {
		timestamps: false
	});
