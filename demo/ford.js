var DataRepo = require("../src/core.js");

var database_config = require("./config/sequelize.json");
var source_config = require("./config/sources.json");
var Models = require("../src/models");



var demo = async function(){

    var datarepo = new DataRepo(database_config, source_config);
    var articles = await datarepo.retrieve({query:"nyse ford", page:1, from:"2018-01-01", to:"2018-01-16"});
    console.log(articles);
    console.log(articles.length);

}
demo();
