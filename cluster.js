var cluster = require('cluster'),
	numCPUS = require('os').cpus().length,
	express = require('express');

if (cluster.isMaster){
	console.log('from master', numCPUS);
	for(var i=0;i<numCPUS;i++){
		cluster.fork();
	}
	cluster.on('online', function(worker){
		console.log('worker is running on %s pid', worker.process.pid);
	});
	cluster.on('exit', function(worker, code, signal){
		console.log('worker is closed %s', worker.process.pid);
	});
}else if (cluster.isWorker){
	var port = 3000;
	console.log('listing pid %s, port %s', cluster.worker.process.pid, port);

	var app = express();
	app.get('*', function(req, res){
		res.send(200, 'cluster ' + cluster.worker.process.pid + ' responsed');
	});

	app.listen(port);
}