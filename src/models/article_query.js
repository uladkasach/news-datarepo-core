'use strict';
/*
    a join table.
    see http://docs.sequelizejs.com/class/lib/associations/belongs-to-many.js~BelongsToMany.html

    use with

    article.addQuery(query)
*/

module.exports = function(sequelize, DataTypes) {
    var Article_Query = sequelize.define('Article_Query',
        {
            // none
        },
    );
    Article_Query.associate = function(models) {
        models.Article.belongsToMany(models.Query, {through: Article_Query})
        models.Query.belongsToMany(models.Article, {through: Article_Query})
    };
    return Article_Query;
};
