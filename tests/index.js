var boot = require('../app').boot,
	shutdown = require('../app').shutdown,
	port = require('../app').port,
	expect = require('expect.js')
	superagent = require('superagent');

	var articles = require('../db/articles.json');

describe('server', function(){
	before(function(){
		boot();
	});

	describe('homepage', function(){
		it('should respond to get', function(done){
			superagent.get('http://localhost:'+port).end(function(err, res){
				expect(res.status).to.equal(200);
				done();
			})
		});

		it('should include all articles', function(done){
			superagent.get('http://localhost:' + port).end(function(res){
				articles.forEach(function(item, index){
					if (item.published){
						expect(res.text).to.contain('<h2><a href="/articles/'+item.slug+'">'+item.title+'</a></h2');
					}else{
						expect(res.text).not.to.contain('<h2><a href="/articles/'+item.slug+'">'+item.title+'</a></h2');
					}
				});
				done();
			});
		});
	});

	describe('article page', function(){
		it('article details', function(done){
			articles.forEach(function(item, index){
				superagent.get('http://localhost:' + port + '/articles/' + item.slug).end(function(res){
					if (item.published){
						expect(res.status).to.be(200);
					}else{
						expect(res.status).to.be(401);
					}
					if (index+1 === articles.length){
						done();
					}
				});

			})
		});
	});

	after(function(){
		shutdown();
	});

});