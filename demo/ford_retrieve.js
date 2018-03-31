var DataRepoApi = require("../src/");
var Source = DataRepoApi.Source;
var Cache = DataRepoApi.Cache;

var database_config = require("./config/sequelize.json");
var source_config = require("./config/sources.json");


var demo = async function(){

    var cache = new Cache(database_config);
    var source = new Source(source_config[0], cache);
    var articles = await source.retrieve({query:"motors", page:"all", from:"2018-01-01", to:"2018-01-15"});
    console.log(articles);
    console.log(articles.length);

}
demo();
