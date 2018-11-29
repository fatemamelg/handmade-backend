var mongoose = require('mongoose')

module.exports = mongoose.model('Post', {
    msg: String,
    tag: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})