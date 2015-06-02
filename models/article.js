var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
	title: {
		type: String,
		require: true, 
		valide: [
			function(value){
				return value.length<=120
			},
			"title is too long 120 max"
		],
		default: 'New Post'
	}, 
	text: String,
	published: {
		type: Boolean,
		default: false
	},
	slug: {
		type: String,
		set: function(value){
			return value.toLowerCase().replace(' ', '-')
		}
	}
});

articleSchema.static({
	list: function(cb){
		this.find({}, null, {sort: {_id: -1}}, cb)
	}
})

module.exports = mongoose.model('Article', articleSchema);