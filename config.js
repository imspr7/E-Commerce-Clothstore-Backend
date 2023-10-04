const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config()

// const monngodb_url="mongodb://localhost:27017/ssstore";
const URL = process.env.MONGO_URL
mongoose.set('strictQuery', false)
const connectToMongo = async () => {

mongoose.connect(URL, {useNewUrlParser: true,useUnifiedTopology: true}).then(()=>{
    console.log("mongodb is connected");
}).catch((error)=>{
    console.log("mondb not connected");
    console.log(error);
});

        console.log("db.connection.host");
}


module.exports = connectToMongo;