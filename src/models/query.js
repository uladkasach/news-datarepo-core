'use strict';
module.exports = function(sequelize, DataTypes) {
    var Query = sequelize.define('Query',
        {
            Identifier : DataTypes.STRING,
        },
    );
    Query.associate = function(models) {
        Query.belongsToMany(models.Article, {through: 'Article_Query'}) // part of Article-Query Many-to-Many relationship
        Query.belongsToMany(models.Subscription, {through: 'Subscription_Query'}) // part of Subscription-Query Many-to-Many relationship
    };
    return Query;
};
