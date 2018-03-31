'use strict';
/*
    note that this data is not used to restart subscriptions - it is just used to distinguish individual subscriptions in the db
*/
module.exports = function(sequelize, DataTypes) {
    var Subscription = sequelize.define('Subscription',
        {
            SourceIdentifier : DataTypes.STRING, // distinguishes between sources+defaults
            QueryParamsJSON : DataTypes.STRING, // distinguishes between queries
            PublicId : {
                type : DataTypes.STRING,
                defaultValue : DataTypes.UUIDV4,
            }
        },
    );
    Subscription.associate = function(models) {
        Subscription.belongsToMany(models.Query, {through: 'Subscription_Query'}) // part of Subscription-Query Many-to-Many relationship
    };
    return Subscription;
};
