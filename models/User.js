var mongoose = require('mongoose')
var fs = require('fs');
var bcrypt = require('bcrypt-nodejs')
var userSchema = new mongoose.Schema({
    img: { data: Buffer, contentType: String },
    email: String,
    pwd: String,
    name: String,
    description: String,
    tele: [Number]
})


userSchema.pre('save', function(next) {
    var user = this

    if(!user.isModified('pwd'))
        return next()
    
    bcrypt.hash(user.pwd, null, null, (err, hash) => {
        if(err) return next(err)

        user.pwd = hash
        next()
    })
})

module.exports = mongoose.model('User', userSchema)
