const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    googleId:{
        type: String,
        required : false,
            },
            facebookId:{
                type: String,
                required : false,
                    },
                    provider:{
                type:String,
                required:true
                    },
            email:{
                type:String,
                required:true,
            },
            password:{
                type:String,
                required:false
            },
    displayName:{
        type: String,
        required : false,
            },
    firstName:{
        type: String,
       required : false,
            },
    lastName:{
        type: String,
        required : false,
            },
            cart:{
                type:Array
            },
     isAdmin:{
        type:Boolean,
        default:false,
        required:true,
        creds:{
            dbName:"n/a",
            default:"n/a"
        }
    },
       createdAt:{
         type:Date,
         default:Date.now
            }
})
module.exports =  mongoose.model('User',UserSchema,'_users')