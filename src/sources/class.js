
var SourceWrapper = function(config, cache){
    // get module
    if(typeof config.module == "undefined") throw new Error("config.module must be defined for source");
    var Source = require(config.module);
    this._module_name = config.module;

    // initialize the source module
    if(typeof config.init_args == "undefined") throw new Error("config.init_args must be defined for a source");
    var source = new Source(...config.init_args);
    this._source = source; // append source to object

    // append cache
    this.cache = cache;
}
SourceWrapper.prototype = {
    retrieve : async function(query_params){
        var query_identifier = this.module_name + "-"
                + JSON.stringify(this._source.query_defaults) + "-" // handles including data from defaults into query cache string
                + JSON.stringify(query_params);
        var articles = await this.cache.retrieve(query_identifier);
        if(articles == null){
            var data_from_cache = false;
            var articles = await this._source.retrieve(query_params);
            this.cache.record(query_identifier, articles);
        } else {
            var data_from_cache = true;
        }
        return [articles, data_from_cache];
    }
}
module.exports = SourceWrapper;
