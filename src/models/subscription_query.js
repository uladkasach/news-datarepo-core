'use strict';
/*
    a join table.
    see http://docs.sequelizejs.com/class/lib/associations/belongs-to-many.js~BelongsToMany.html

    use with

    subscription.addQuery(query)

    used to cache as much as possible - enables multiple subscriptions to share queries in addition to each subscription having multiple queries
*/

module.exports = function(sequelize, DataTypes) {
    var Subscription_Query = sequelize.define('Subscription_Query',
        {
            // none
        },
    );
    Subscription_Query.associate = function(models) {
        models.Subscription.belongsToMany(models.Query, {through: Subscription_Query})
        models.Query.belongsToMany(models.Subscription, {through: Subscription_Query})
    };
    return Subscription_Query;
};
