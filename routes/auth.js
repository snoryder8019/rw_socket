module.exports = {
    ensureAuth: function (req, res, next){
        if (req.isAuthenticated()){
            return next()
        }else{
            res.render('index',{message:"you have to be logged in for that"})
        }
    },
    ensureGuest: function (req,res,next){
        if(req.isAuthenticated()){
            res.redirect('/')
        }else{
            return next()
        }

    }
}