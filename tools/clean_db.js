var models = require(__dirname + "/../src/models")
models.sequelize.sync({force : true})
    .then(()=>{
        console.log("database has been cleaned");
    })
