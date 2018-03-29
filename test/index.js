var assert = require("assert");

var Models = require("../src/models")
var Cache = require("../src/cache")
var Source = require("../src/sources/class.js")

var news_api_live_config = require("./config/sources.json")[0];
var sequelize_config = require("./config/sequelize.json");


// unhandled promisses add details:
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});



describe("models", function(){
    it("should be able to initialize database",  async function(){
        var models = new Models(sequelize_config);
        await models.promise_initialized;
    })
})
return;
describe("caching", function(){
    it("should find no articles for a non-cached query", async function(){
        var cache = new Cache(sequelize_config);
        var articles = await cache.retrieve("non existant query");
        assert.equal(articles, null);
    })
    it("should cache articles for a query", async function(){
        var articles = [
            {
                published : "2018-03-29 05:43:31",
                title : "title goes here",
                description : "description goes here",
                url : "test.com",
            },
            {
                published : "2018-03-29 05:43:31",
                title : "title goes here 2",
                description : "description goes here 2",
                url : "test.com",
            }
        ]
        var query_identifier = "test_query-" + new Date(); // ensure that query id is unique

        // cache the query
        await cache.record(query_identifier, articles);

        // retreive the data
        var articles = await cache.retrieve(query_identifier);
        assert.equal(articles.length, 2)
    })
    it("should not duplicate articles if they are the same", async function(){
        var articles = [
            {
                published : "2018-03-29 05:43:31",
                title : "title goes here",
                description : "description goes here",
                url : "test.com",
            },
            {
                published : "2018-03-29 05:43:31",
                title : "title goes here",
                description : "description goes here",
                url : "test.com",
            },
        ]
        var query_identifier = "test_query-2-" + new Date(); // ensure that query id is unique

        // cache the query
        await cache.record(query_identifier, articles);

        // retreive the data
        var articles = await cache.retrieve(query_identifier);
        assert.equal(articles.length, 1)
    })
})
return;
describe("sources", function(){
    describe("initialization", function(){
        it("should be able to load a source from a config", async function(){
            /*
            var config = {
                module : "news-datarepo-newsapi.org",
                init_args : [
                    "an_api_key",
                    {
                        endpoint : "everything",
                        language : "en",
                        catagory : "business",
                    }
                ]
            }
            */
            var newsapi_source = new Source(news_api_live_config);
        })
    })
    describe("querying", async function(){
        it("should be able to retrieve uncached data from a source", async function(){
            this.skip();
            var newsapi_source = new Source(news_api_live_config);
            var [articles, from_cache] = await newsapi_source.retrieve({query:"ford nyse"});
            assert.equal(Array.isArray(articles), true);
            assert.equal(from_cache, false);
        })
        it("should be able to retrieve uncached data from a source", async function(){
            var newsapi_source = new Source(news_api_live_config);
            var [articles, from_cache] = await newsapi_source.retrieve({query:"ford nyse"});
            assert.equal(Array.isArray(articles), true);
            assert.equal(from_cache, true);
        })
    })
})
