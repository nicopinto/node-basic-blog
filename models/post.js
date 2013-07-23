var mongoose = require('mongoose'),
	postSchema = mongoose.Schema({
		guid: Number,
	    title: String,
	    content: String,
	    link: String
	}),
	Post = mongoose.model('Post', postSchema);

mongoose.connect('mongodb://localhost/test');

exports.model = Post;
exports.connection = mongoose.connection;