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
    retrieve : async function(query_identifier, subscription){
        // wait for db to be loaded
        await this.models.promise_initialized;

        // ensure identifier is valid
        if(typeof query_identifier != "string") throw new Error("query_identifier must be a string");

        // if query not in database, return null
        var query = await this.models.Query.find({where:{Identifier : query_identifier}})
        if(query == null) return null; // return that no data exists if query has not yet been defined

        // if query exists and it is retreived for a subscription, ensure that it is added to the subscription
        if(typeof subscription != "undefined") await subscription.addQuery(query);

        // if in database, return all articles for query
        var articles = await query.getArticles();
        return articles;
    },
    record : async function(query_identifier, articles){
        // wait for db to be loaded
        await this.models.promise_initialized;

        // ensure identifier is valid
        if(typeof query_identifier != "string") throw new Error("query_identifier must be a string");

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
            await query.addArticle(article); // add article to the query;
        }

        // resolve with success
        return true;
    },
    read : async function(subscription_id){
        // wait for db to be loaded
        await this.models.promise_initialized;

        // retreive subscription
        if(typeof subscription_id != "string") throw new Error("subscription id must be a string");
        var subscription = await this.models.Subscription.find({where:{PublicId:subscription_id}});
        if(subscription == null) throw new Error("this subscription does not exist");

        // retreive queries for subscription
        var queries = await subscription.getQueries();

        // merge articles for each query uniquely
        var article_map = {};
        for(var i = 0; i < queries.length; i++){
            var query = queries[i];
            var articles = await query.getArticles();
            articles.forEach((article)=>{
                article_map[article.id] = article; // append each article to map; note that duplicates overwrite previous
            })
        }
        var articles = Object.values(article_map); // exctract articles into a list

        // return unique articles
        var articles = articles.map(article=>article.get({plain:true})); // extract raw data from wrapped sequelize instance
        return articles;
    },
    subscribe : async function(cron, source_instance_identifier, query_params, start_date, end_date){
        var [subscription, __] = await this.models.Subscription.findOrCreate({
            where : {
                SourceIdentifier : source_instance_identifier, // distinguishes between sources
                QueryParamsJSON : JSON.stringify(query_params), // distinguishes between queries
            }
        })
        return subscription;
    },
}


module.exports = Cache;
