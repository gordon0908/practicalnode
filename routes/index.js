exports.article =  require('./article');
exports.user = require('./user');

exports.index = function(req, res, next){
	req.models.Article.list(function(error, items){
		if (error){
			return next(error)
		}
		res.render('index', {articles: items})
	})


};