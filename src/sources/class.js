var md5 = require('md5');

var SourceWrapper = function(config, cache){
    // get module
    if(typeof config.module == "undefined") throw new Error("config.module must be defined for each source");
    var Source = require(config.module);

    // initialize the source module
    if(typeof config.init_args == "undefined") throw new Error("config.init_args must be defined for each source");
    var source = new Source(...config.init_args);
    this._source = source; // append source to object

    // append cache identifier
    if(config.cache_identifier == "auto"){ // if user requested auto, generate it in a potentially dangerous way (if an api key is in init_args its dangerous)
        var default_identifier = (config.module+"-"+JSON.stringify(config.init_args));
        default_identifier = md5(default_identifier);
        config.cache_identifier = default_identifier;
    }
    if(typeof config.cache_identifier != "string") throw new Error("config.cache_identifier must be a string");
    this.cache_identifier = config.cache_identifier;

    // append cache
    if(typeof cache == "undefined" || typeof cache.retrieve == "undefined" || typeof cache.record == "undefined") throw new Error("cache object must be passed");
    this.cache = cache;
}
SourceWrapper.prototype = {
    retrieve : async function(query_params){
        var articles = await this._retreive_articles_with_caching(query_params);
        return articles;
    },
    subscribe : async function(query_params, interval){
        // TODO
    },
    read : async function(subscription_id){
        // read subscription
    },

    /*
        helper methods
    */
    _retreive_articles_with_caching : async function(query_params, subscription){
        // define query_identifier - used for caching
        var source_instance_identifier = this.cache_identifier;
        var parameters_identifier = JSON.stringify(query_params);
        var query_identifier = source_instance_identifier + "-" + parameters_identifier;

        // retreive data
        var articles = await this.cache.retrieve(query_identifier);
        if(articles == null){
            var data_from_cache = false;
            var articles = await this._source.retrieve(query_params);
            await this.cache.record(query_identifier, articles, subscription);
            var articles = await this.cache.retrieve(query_identifier); // retreive articles from db after caching them
        } else {
            var data_from_cache = true;
        }
        return [articles, data_from_cache];
    }
}
module.exports = SourceWrapper;
