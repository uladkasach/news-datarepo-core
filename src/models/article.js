'use strict';
module.exports = function(sequelize, DataTypes) {
    var Article = sequelize.define('Article',
        {
            //Publisher : DataTypes.STRING,
            Published : DataTypes.DATE,
            Title : DataTypes.STRING,
            Description : DataTypes.TEXT,
            Url : DataTypes.STRING,
        },
    );
    Article.associate = function(models) {
        Article.belongsToMany(models.Query, {through: 'Article_Query'}) // part of Article-Query Many-to-Many relationship
    };
    return Article;
};
