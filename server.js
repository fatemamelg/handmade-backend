var express = require('express')
var router = express.Router();
var cors = require('cors')
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var app = express()
var jwt = require('jwt-simple')
var multer = require('multer');
var fs = require('fs')
const cloudinary = require("cloudinary");
const cloudinaryStorage = require("multer-storage-cloudinary");
var upload = multer({ dest: 'uploads/' }).single('photo')


var User = require('./models/User.js')
var Post = require('./models/Post')
var Category = require('./models/Category')
var auth = require('./auth.js')

// set the directory for the uploads to the uploaded to
var DIR = './uploads/';

//define the type of upload multer would be doing and pass in its destination, in our case, its a single file with the name photo
var upload = multer({ dest: DIR }).single('photo');

mongoose.Promise = Promise

app.use(cors())
app.use(bodyParser.json())

app.get('/uploads/:filename', function (req, res, next) {
    var filename = req.params.filename;
    var path = DIR + filename;
    fs.exists(path, (exists) => {
        console.log(__dirname);
        if (exists) {
            res.status(200).sendFile(path, { root: __dirname });
        } else {
            return res.status(404).send("File not found.");
        }
    });
})

app.post('/uploads', function (req, res, next) {
    var path = '';
    upload(req, res, function (err) {
       if (err) {
         // An error occurred when uploading
         console.log(err);
         return res.status(422).send("an Error occured")
       }  
      // No error occured.
       path = req.file.path;
       return res.send("Upload Completed for " + path); 
 });     
})

//create a cors middleware
app.use(function(req, res, next) {
//set headers to allow cross origin request.
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.post('/api/photo', function (req, res) {
    var user = new User();
    user.img.data = fs.readFileSync(req.files.userPhoto.path)
    user.img.contentType = 'image/png';
    user.save();
})

function checkAuthenticated(req, res, next) {
    if (!req.header('authorization'))
        return res.status(401).send({ message: 'Unauthorized. Missing Auth Header' })

    var token = req.header('authorization').split(' ')[1]

    var payload = jwt.decode(token, '123')

    if (!payload)
        return res.status(401).send({ message: 'Unauthorized. Auth Header Invalid' })

    req.userId = payload.sub

    next()

}

app.get('/posts/:id', async (req, res) => {
    var author = req.params.id
    var posts = await Post.find({ author })
    res.send(posts)
})

app.get('/posts', async (req, res) => {

    try {
        var posts = await Post.find({})
        res.send(posts)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

app.post('/posts', auth.checkAuthenticated, (req, res) => {
    var postData = req.body
    postData.author = req.userId
    postData.tag = req.catId

    var post = new Post(postData)

    post.save((err, result) => {
        if (err) {
            console.error('saving post error')
            return res.status(500).send({ message: 'saving post error' })
        }
        res.sendStatus(200)
    })
})

// Post Crochet products
app.post('/categories', async (req, res) => {

    var postCat = req.body

    var cat = new Category(postCat)

    cat.save((err, result) => {
        if (err) {
            console.error('saving category error')
            return res.status(500).send({ message: 'saving category error' })
        }
        res.sendStatus(200)
    })

})

app.get('/categories/:id', async (req, res) => {

    try {
        var category = await Category.findById(req.params.id)
        res.send(category)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

})

app.get('/users', async (req, res) => {
    try {
        var users = await User.find({}, '-pwd -__v')
        res.send(users)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

})

app.get('/profile/:id', async (req, res) => {

    try {
        var user = await User.findById(req.params.id, '-pwd -__v')
        res.send(user)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }

})

mongoose.connect('mongodb://test:testtest6@ds241723.mlab.com:41723/pssocial', { useNewUrlParser: true }, (err) => {
    if (!err)
        console.log('connected to mongo')
})

app.use('/auth', auth.router)
app.listen(process.env.PORT || 3000)