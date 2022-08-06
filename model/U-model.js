const mongoose = require('mongoose');

//User schema
const DetailsSchema = mongoose.Schema({
    username : {type: String, require : true},
    email : {
        type: String,         
        required: true,                
    },
    password : {
        type: String,              
        required: true,                     
    },
    status : {
        type : String,
        enum : ['pending','active'],
        default : 'pending'
    },
    token: { type: String },
    
},{timestamps : true})
module.exports = mongoose.model("User",DetailsSchema);
