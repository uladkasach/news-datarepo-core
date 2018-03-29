var assert = require("assert");

var Models = require("../src/models")
var Cache = require("../src/cache")
var Source = require("../src/sources/class.js")
var DataRepo = require("../src/core.js");

var source_config =  require("./config/sources.json");
var news_api_live_config = source_config[0];
var sequelize_config = require("./config/sequelize.json");


// unhandled promisses add details:
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

var thorough = false;


describe("models", function(){
    it("should be able to initialize database",  async function(){
        var models = new Models(sequelize_config);
        await models.promise_initialized;
    })
    it("it should find that models are accessable through the object",  async function(){
        var models = new Models(sequelize_config);
        assert.equal(typeof models.Article, "function"); // testing one is enough.
    })
})
describe("caching", function(){
    it("should find no articles for a non-cached query", async function(){
        var cache = new Cache(sequelize_config);
        var articles = await cache.retrieve("non existant query");
        assert.equal(articles, null);
    })
    it("should cache articles for a query", async function(){
        var cache = new Cache(sequelize_config);
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
        var cache = new Cache(sequelize_config);
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
            if(!thorough) this.skip();
            var cache = new Cache(sequelize_config);
            await cache.promise_initialized;
            var newsapi_source = new Source(news_api_live_config, cache);
            var [articles, from_cache] = await newsapi_source.retrieve({query:"ford nyse"});
            assert.equal(Array.isArray(articles), true);
            assert.equal(from_cache, false);
        })
        it("should be able to retrieve uncached data from a source", async function(){
            var cache = new Cache(sequelize_config);
            var newsapi_source = new Source(news_api_live_config, cache);
            var [articles, from_cache] = await newsapi_source.retrieve({query:"ford nyse"});
            assert.equal(Array.isArray(articles), true);
            assert.equal(from_cache, true);
        })
    })
})
describe("core", function(){
    it("should be able to initialize", function(){
        var datarepo = new DataRepo(sequelize_config, source_config);
    })
    it("should be able to retreive data", async function(){
        var datarepo = new DataRepo(sequelize_config, source_config);
        var articles = await datarepo.retrieve({query:"nyse ford", page:1, from:"2018-01-01", to:"2018-01-15"});
        assert.equal(Array.isArray(articles), true);
    })
})