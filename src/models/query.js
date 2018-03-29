'use strict';
module.exports = function(sequelize, DataTypes) {
    var Query = sequelize.define('Query',
        {
            Identifier : DataTypes.STRING,
        },
    );
    Query.associate = function(models) {
        Query.belongsTo(models.Subscription); // may or maynot belong to a subscription, that is
    };
    return Query;
};
