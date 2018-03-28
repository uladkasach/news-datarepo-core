# News.DataRepo Core

### Purpose:
REST API interface for retreiving news about any stock index or other query
    - e.g., `NYSE:F`, `NYSE:SP500`
    - e.g., `trucks`, `cars`, `...`

### difference:
Difference between this and newsapi.org is:
1. that we cache the data for more than 1 month
2. "subscribe to reports and store data" service
3. launch the software on your own server and retreive data

### usage
Launch on own server or use NewsOracle.Org for keeping data cached (db service) + get data from their cache


### Data Stored
```
    {
        source : __,
        timestamp : __,
        title : __,
        url : __,
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
