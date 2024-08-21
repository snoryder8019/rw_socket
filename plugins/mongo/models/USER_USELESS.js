const mongoose = require('mongoose');

  // User doesn't exist, create new user object
  user = {
    providerID: profile.id,
    provider: provider,
    email: profile.emails[0].value,
    displayName: profile.displayName,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    password: '',
    isAdmin: false,
    cart: [],
    notifications:[],
    images: [{thumbnailUrl: "/images/hugeIcon.png", avatarTag: true}],
    clubs: [],
    subscription: "free",
    permissions:{
      admin:false,
      users:false,
      games:false,
      videoLead:false,
      videoProduction:false,
      bingoLead:false,
      tickets:false,
      chat:false,
      travel:false,
      clubs:false,
      blogs:false,
      webapp:false,
      permissions:false,
      
    },
    wallet: {
      emerald:0,
      sapphire:0,
      amethyst:0
    },
  };

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