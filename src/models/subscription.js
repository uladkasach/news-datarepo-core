'use strict';
module.exports = function(sequelize, DataTypes) {
    var Subscription = sequelize.define('Subscription',
        {
            Identifier : DataTypes.STRING,
            Cron : DataTypes.STRING, // cron definition for how often it should be run
            QueriesJSON : DataTypes.STRING, // json of queries to run
        },
    );
    Subscription.associate = function(models) {
        Subscription.hasMany(models.Query); // defines for example : model.getChildren()
    };
    return Subscription;
};
