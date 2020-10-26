
const mongoose = require("mongoose");
 
const commentSchema =  mongoose.Schema({
    comment_body: {
        type: String
    },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        username: String
    },
    date: {
        type: Date,
        default: Date.now()
     },
     commentIsApproved: {
        type: Boolean,
        default: false
     }
});
 
module.exports = mongoose.model("comment", commentSchema);