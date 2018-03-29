/*
    cache deals with
    1. queries (query_identifier strings)
    2. articles

    the same article may be found for multiple queries.
        therefore we need a query-article mapping table

    when caching,
    1. find article id
        - check that article if article already exist in db by matching URL + title + published, if so return id
            - TODO - consider what to do when two urls exist
        - if not exists, create article record in db


*/
var Models = require("../models")

var Cache = function(database_config){
    var models = new Models(database_config); // initialize database w/ the config supplied
    this.models = models;
}

Cache.prototype = {
    retrieve : async function(query_identifier){
        // if query not in database, return null
        var query = await this.models.Query.find({where:{Identifier : query_identifier}})
        if(query == null) return null; // return that no data exists if query has not yet been defined

        // if in database, return all articles for query
        var articles = await query.getArticles();
        return articles;
    },
    record : async function(query_identifier, articles){
        // find query. if query exists, warn user. if query does not, create it
        var [query, created] = await this.models.Query.findOrCreate({where:{Identifier : query_identifier}})
        if(!created) console.log("query for " + query_identifier + " already exists... why did we not use cache.retreive instead?");

        // find or create each article. ensure each is associated with query
        for(var i = 0; i < articles.length; i++){
            var article_data = articles[i];
            var [article, created] = await this.models.Article.findOrCreate({where:{
                Published : article_data.published,
                Title : article_data.title,
                Description : article_data.description,
                Url : article_data.url,
            }})
            query.addArticle(article); // add article to the query
        }

        // resolve with success
        return true;
    },
}


module.exports = Cache;
