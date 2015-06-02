var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true,
		set: function(value){
			return value.trim().toLowerCase()
		}
	},
	password: String,
	admin: {
		type: Boolean,
		default: false
	}
});

module.exports = mongoose.model('User', userSchema);