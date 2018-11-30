var mongoose = require('mongoose')

module.exports = mongoose.model('Post', {
    img: String,
    msg: String,
    tag: String,
    price: Number,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})