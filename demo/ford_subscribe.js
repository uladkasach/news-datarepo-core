var DataRepoApi = require("../src/");
var Source = DataRepoApi.Source;
var Cache = DataRepoApi.Cache;

var database_config = require("./config/sequelize.json");
var source_config = require("./config/sources.json");


var demo = async function(){

    var cache = new Cache(database_config);
    var source = new Source(source_config[0], cache);
    var subscription_id = await source.subscribe({query:"ford nyse"}, {cron:"* * * * *", interval:"daily", start_date : "2018-03-20"});
    console.log(subscription_id);

}
demo();
