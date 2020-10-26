const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const Category = require('../models/category');
const middleware = require("../middleware");
const Comment = require("../models/comment");


router.get('/', async(req, res) => {
    const posts = await Post.find();
    const categories = await Category.find();
    res.render('default/index', { posts: posts, categories: categories });
})

// Single Post
router.get('/:id', (req, res) => {

    Post.findById(req.params.id)
        .populate('comments')
        .exec(async(err, post) => {
            if (err && !post) {
                console.log(err)
            } else {
                console.log(post)
                const categories = await Category.find();
                res.render('default/singlePost', { post: post, categories: categories });
            }
        })
});

//CREATE NEW POST
router.get('/new', (req, res) => {
    Category.find().then(categories => {

        res.render('posts/newPost', { categories: categories });
    });


})

/*
//EDIT - edit selected post
router.get('/edit/:id/', function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        Category.find({}, function(err, cats) {
            res.render('posts/edit', { post: foundPost, cats: cats });
        })

    })
})

//UPDATE - update selected post

router.put('/:id', function(req, res) {

    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, UpPost) {
        if (err && !UpPost) {

            res.redirect('/admin/posts')
        } else {

            res.redirect('/admin/posts/' + req.params.id)

        }

    })
})
*/


//ADD NEW COMMENT TO POST
router.post('/:id', middleware.isLoggedIn, (req, res) => {
    //find post to add a comment on by id
    const post_id = req.params.post_id;

    Post.findById(id, (err, post) => {
        if (err) {
            console.log('post exists')
        } else {
            const { commentBody } = req.body.comment_body;
            Comment.create(commentBody, (err, newComment) => {
                if (err) {
                    console.log(err)
                } else {
                    newComment.author.id = req.user._id;
                    newComment.author.username = req.user.username;
                    newComment.save();
                    post.comments.push(newComment);
                    post.save()
                    res.redirect('/posts/' + post_id)
                    console.log(newComment)
                }
            })
        }
    })
})

module.exports = router;