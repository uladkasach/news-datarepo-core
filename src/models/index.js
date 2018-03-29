'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename); // in this case it should be _index.js
var skip_list = [basename, "index.js", "_util.js"]; // files that are not models
var env       = process.env.NODE_ENV || 'development';
var config    = require(__dirname + '/../../config/sequelize.json');
var db        = {};

if (config.use_env_variable) {
    var sequelize = new Sequelize(process.env[config.use_env_variable]);
} else {
    var sequelize = new Sequelize(config.database, config.username, config.password, config);
}

////////////////////////////
// Load all models from this directory
////////////////////////////
fs
    .readdirSync(__dirname)
    .filter(function(file) {
        return (file.indexOf('.') !== 0) && (!skip_list.includes(file)) && (file.slice(-3) === '.js');
    })
    .forEach(function(file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });


/////////////////////////////
// define all associations
/////////////////////////////
Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});
db.sequelize = sequelize;
db.Sequelize = Sequelize;


//////////////////////////////
// define initialization function
//////////////////////////////
db.initialize = function(){
    // sync databse
    var promise_to_sync_database = db.sequelize.sync({force : false});

    // define static data
    var promise_to_define_static_data = promise_to_sync_database
        .then((data)=>{
            Object.keys(db).forEach(function(modelName) {
                if (db[modelName].load_static_data) {
                    db[modelName].load_static_data(db);
                }
            });
            return true;
        })

    // add handler to db which resolves when initialized
    db.initialized = promise_to_define_static_data;

    // return resolution
    return promise_to_define_static_data;
}



///////////////////////////////
// export this module
///////////////////////////////
module.exports = db;
