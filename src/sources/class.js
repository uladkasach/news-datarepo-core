var md5 = require('md5');
var moment = require("moment");
var _cron = require('node-cron');

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
        var [articles, __] = await this._retreive_articles_with_caching(query_params);
        var cleaned_articles = articles.map((article)=>article.get({plain:true}))
        return cleaned_articles;
    },
    subscribe : async function(query_params, schedule){
        // extract cron from interval data
        if(typeof schedule.cron == "undefined" && schedule.interval == "daily") var cron = "0 7,19 * * *"; // run daily at 07:00 and 19:00
        if(typeof schedule.cron == "undefined" && schedule.interval == "weekly") var cron = "0 7 * * 1"; // run every monday at 07:00
        if(typeof schedule.cron == "string") var cron = schedule.cron;
        var cron_is_valid = _cron.validate(cron);
        if(cron != "none" && !cron_is_valid) throw new Error("cron is not valid");

        // convert invterval string to moment increment unit (to be used in incrementing each time called)
        if(schedule.interval == "daily") var interval_unit = "day";
        if(schedule.interval == "weekly") var interval_unit = "week";
        if(typeof interval_unit == "undefined") throw new Error("please make sure that interval is `daily` or `weekly`")

        // retreive persistant subscription object from database - findOrCreate
        var subscription = await this.cache.subscribe(cron, this.cache_identifier, query_params, schedule.start_date, schedule.end_date)

        // define dates for which to run query immediately // .format("YYYY-MM-DD")
        var today_date = moment().format("YYYY-MM-DD");
        var today_time = moment(today_date);
        if(typeof schedule.start_date == "undefined") schedule.start_date = today_time;
        var start_time = moment(schedule.start_date);
        if(typeof schedule.end_date == "undefined") schedule.end_date = today_time;
        var final_end_time = moment(schedule.end_date);

        // run query for each data between final_end_time and start time
        while(final_end_time > start_time){
            // update start and end values:
            var start_time = (typeof end_time == "undefined")? start_time : end_time.clone(); // if endtime not defined, just use the first start time
            var end_time = start_time.clone().add(1, interval_unit);
            var start_date = start_time.format("YYYY-MM-DD");
            var end_date = end_time.format("YYYY-MM-DD");
            console.log("running query for " + start_date + " to " + end_date);

            // generate 'timed' query
            var timed_query = Object.assign({}, query_params);
            timed_query.from = start_date;
            timed_query.to = end_date;

            // wait for query to resolve!
            await this._retreive_articles_with_caching(timed_query, subscription); // wait untill that request has fulfilled

            // dev tool - infi loop prevention - for when testing
            if(false){
                var increment = (typeof increment == "number")? increment += 1: 0;
                if(increment > 20) break;
            }
        }

        // start cron job of running retreive for this query at each of the times
        //      - note, that the schedule.interval is defined we want to modify the start and end date of the query before running
        if(cron === "none") return subscription.PublicId; // if user defined cron as  "none" - then dont run the cronjob (they probably just wanted to run the query repeatedly from a certain date)
        // TODO - make cron end by schedule.end_date
        _cron.schedule(cron, async function(){
            // get today date
            var today_date = moment().format("YYYY-MM-DD");
            var today_time = moment(today_date);

            // define start date and end date based on today; today should be last and start at today-interval
            var start_time = today_time.clone().subtract(1, interval_unit);
            var start_date = start_time.format("YYYY-MM-DD");
            var end_time = today_time.clone();
            var end_date = end_time.format("YYYY-MM-DD");
            console.log("running query for " + start_date + " to " + end_date);

            // generate 'timed' query
            var timed_query = Object.assign({}, query_params);
            timed_query.from = start_date;
            timed_query.to = end_date;

            // wait for query to resolve!
            await this._retreive_articles_with_caching(timed_query, subscription); // wait untill that request has fulfilled
        }.bind(this));

        // return the subscription id
        return subscription.PublicId;
    },
    read : async function(subscription_id){
        // read subscription
        return await this.cache.read(subscription_id);
    },

    /*
        helper methods
    */
    _retreive_articles_with_caching : async function(query_params, subscription){
        //console.log("running query :" + JSON.stringify(query_params));
        // define query_identifier - used for caching
        var source_instance_identifier = this.cache_identifier;
        var parameters_identifier = JSON.stringify(query_params);
        var query_identifier = source_instance_identifier + "-" + parameters_identifier;

        // retreive data
        console.log(query_identifier);
        var articles = await this.cache.retrieve(query_identifier, subscription);
        if(articles == null){
            var data_from_cache = false;
            var articles = await this._source.retrieve(query_params);
            await this.cache.record(query_identifier, articles);
            var articles = await this.cache.retrieve(query_identifier, subscription); // retreive articles from db after caching them
        } else {
            var data_from_cache = true;
        }
        return [articles, data_from_cache];
    }
}
module.exports = SourceWrapper;
