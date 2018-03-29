# News.DataRepo Core

## Usage

### retreive / subscribe - to a request from a source
- core wraps sources, which you can initialize from a config.json object, and caches requests that you send from it
    - subscription runs retreivals on a `cron` and asks cache not to associate duplicate articles

### Source Config
- cache_identifier :
    - defined for a source for each set of defaults. should be defined based on [model_name, defaults]
    - "auto" can be used to define the `cache_identifier` as `md5(model_name+"-"+JSON.stringify(init_args))`
        - NOTE: this is dangerous as if you use APIKeys your apikey is stored in a cryptographically insecure way

## Notes

### Purpose:
REST API interface for retreiving news about any stock index or other query
    - e.g., `NYSE:F`, `NYSE:SP500`
    - e.g., `trucks`, `cars`, `...`



### key features
- send queries to sources, cache the response, return all data
- "subscribe" to a data feed
    - define what queries to run for the subscription, define title of subscription, return all news results for subscription
    - run "every X"
- TODO : search all articles based on
    - key words (in titles)(in text?)
    - date
- TODO: enables users to scrape the data easily into their own servers
    - should give lots of warning that they should not share this data as it is copy writed


### difference:
Difference between this and newsapi.org is:
- not a service that aggregates all news data, this is software that enables developers to setup their own aggregation servers
    - not as in depth as newsapi.org
- e.g., launch the software on your own server and retrieve data


### can enable
- "subscribe to reports and store data" service where users dont have to make their own dbs


### usage
Launch on own server or use NewsOracle.Org for keeping data cached (db service) + get data from their cache


### Data Stored
```js
    {
        publisher : __, // extracted from url
        timestamp : __, // retreived from sources
        title : __, // retreived from sources
        description : __, // retreived from sources
        url : __, // retreived from sources
    }
```


### Data Sources:
- aggregators
    - newsapi
    - google_news_rss
- publishing companies
    - reuters
    - ...

### interfacing with sources
- handled as configurable "plugins"
    - e.g., plugin sourcing from `reuters`
    - e.g., plugin sourcing from `newsapi` and plugin your apikey


### should support:
- api access to data
- manual access to data
- free access to data from past month
    - up to N requests
- cheap access to one bulk request (e.g., for research)

### should be able to:
be initialized from a config file:
- sources to be used
    - including all initialization params for each source
- db credentials
    - which are used to ensure tables are setup and for caching in future
