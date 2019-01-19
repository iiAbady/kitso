module.exports = (sequelize, DataTypes) =>
	sequelize.define('tags', {
		user: {
			type: DataTypes.STRING(25), // eslint-disable-line new-cap
			allowNull: false
		},
		guild: {
			type: DataTypes.STRING(25), // eslint-disable-line new-cap
			allowNull: false
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false
		},
		aliases: {
			type: DataTypes.ARRAY(DataTypes.STRING), // eslint-disable-line new-cap
			defaultValue: []
		},
		content: {
			type: DataTypes.STRING(1950), // eslint-disable-line new-cap
			allowNull: false
		},
		hoisted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false
		},
		uses: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		},
		last_modified: { // eslint-disable-line camelcase
			type: DataTypes.BIGINT
		}
	}, {
		timestamps: true,
		indexes: [
			{ fields: ['user'] },
			{ fields: ['guild'] },
			{ fields: ['name'] }
		]
	});
