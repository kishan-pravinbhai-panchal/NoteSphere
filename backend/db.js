const mongoose = require('mongoose')
const MongoURI = "mongodb://localhost:27017/inotebook2"

const connectToMongo=()=>{
    mongoose.connect(MongoURI);
    console.log("CONNECTEC TO MONGODB SUCCESSSFULLY");
}

module.exports = connectToMongo;