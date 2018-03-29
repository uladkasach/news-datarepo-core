/*
    source interface
    1. use wrapper to load and initialize each source requested in config
    3. present all wrapped and ready sources
*/
var source_config = require("../config/sources.json");
var Source = require("./class.js")
