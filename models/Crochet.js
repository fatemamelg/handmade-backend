var mongoose = require('mongoose')

module.exports = mongoose.model('Crochet', {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }
})