/*
    initialize sources
*/
var Source = require("./sources/class.js");
var Cache = require("./cache/index.js");

var Core = function(database_config, source_configs){
    // initialize the cache
    var cache = new Cache(database_config);
    this.cache = cache;

    // initialize wrapped sources
    var sources = [];
    source_configs.forEach((config)=>{
        var source = new Source(config, cache); // note, the source wrappers handle caching (and building the cache id for each query) on their own
        sources.push(source);
    })

    // attach sources
    this.sources = sources;
}
Core.prototype = {
    retrieve : async function(query_params){
        // await for cache to be loaded
        await this.cache.promise_initialized;

        // run the query on each source
        var articles_map = {};
        for(var i = 0; i < this.sources.length; i++){
            var source = this.sources[i];
            var [articles, __] = await source.retrieve(query_params);
            articles.forEach((article)=>{
                articles_map[article.id] = article; // attach by id to overwrite duplicates
            })
        }

        // extract
        var articles = Object.values(articles_map); // extract articles from map now that we know we dont have duplicates

        // return all articles
        return articles;
    },
    subscribe : function(cron, query_params){
        // TODO
        // run this.retreive(query_params) every `cron`
    }
}
module.exports = Core;
