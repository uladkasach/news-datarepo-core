'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');


var Models = function(config, bool_force_sync){
    // initialize sequelize
    var sequelize = new Sequelize(config.database, config.username, config.password, config);

    // append the sequelize instance and Class to the model so it can be referenced directly
    this.sequelize = sequelize;
    this.Sequelize = Sequelize;

    // load models in the __dirname
    var models = this.__load_from_dir(__dirname);

    // define all associations between models
    this.__define_model_associations(models);

    // start and sync the database
    if(bool_force_sync !== true) bool_force_sync = false; // default to false
    this.promise_initialized = this.sequelize.sync({force : bool_force_sync});
}
Models.prototype = {

    /*
        note, all methods are prepended with `__` to:
            - fully eliminate the possibility that model names do not collide with method names
            - ensure that private methods are known to be private
    */
    __load_from_dir : function(dir_root){
        // get all files
        var file_list = fs.readdirSync(dir_root);

        // filter files to find which ones are models
        var skip_list = ["index.js"];
        var file_list_of_models = file_list.filter(function(file) {
                var starts_with_dot = (file.indexOf('.') == 0);
                var starts_with_underscore = (file.indexOf('_') == 0);
                var blacklisted_name = skip_list.includes(file);
                var is_js_file = (file.slice(-3) === '.js');
                return !starts_with_dot && !starts_with_underscore && !blacklisted_name && is_js_file;
            })

        // grab and initialize each model
        var modules = {};
        file_list_of_models.forEach((file)=>{
            var full_path = path.join(__dirname, file);
            var model = this.sequelize['import'](full_path);
            modules[model.name] = model; // append to /this/ model
        });

        // return modules data
        return modules;
    },

    // define all associations: e.g., belongsTo
    __define_model_associations : function(models){
        var model_keys = Object.keys(models)
        model_keys.forEach(function(model_name) {
            if (models[model_name].associate)  models[model_name].associate(models); // if associate fn is defined, run associate and pass all models to it
        });
    },
}

module.exports = Models;
