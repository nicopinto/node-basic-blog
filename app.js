var http = require('http'),
	router = require('./router.js');
	
http.createServer(router).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');