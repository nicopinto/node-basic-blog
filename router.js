var router = function (req, res) {

  var mimetypes = {
      'css': 'text/css',
      'js': 'application/x-javascript',
      'jpg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif'
    },
    stringify = require('json-stringify-safe'),
    fs = require('fs'),
    jade = require('jade'),
    Post = require('./models/post'),
    url = require('url'),
    querystring = require('querystring');


  var db = Post.connection;
  db.on('error', console.error.bind(console, 'connection error:'));

  if(fs.existsSync('./' + req.url) && req.url != "/"){
    var extension = req.url.substr(req.url.lastIndexOf('.') + 1),
      contentType = mimetypes[extension],
      fileString = fs.readFileSync('./' + req.url);
    if(contentType){
      res.writeHeader(200, {'Content-Type': contentType});  
    }else{
      res.writeHeader(200, {'Content-Type': 'text/plain'});
    }
    res.write(fileString);  
    res.end();
  }

  var is3Multiplo = function (num){
    var result = num / 3,
      isInt = result % 1 === 0;
    return isInt;
  }, getAllCookies = function(req){
    // To Get a Cookie
    var cookies = {};
    req.headers.cookie && req.headers.cookie.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    return cookies;
  };
    
  if(req.url === "/posts"){

    if(req.method === "GET"){
      //res.writeHead(200, {'Content-Type': 'application/json'});
      res.writeHead(200, {'Content-Type': 'text/html'});

      var layoutString = fs.readFileSync('./views/posts.jade'),
        posts = fs.readFileSync('./data/posts.json'),
        fn = jade.compile(layoutString, {}),
        cks = getAllCookies(req);

      Post.model.find(function (err, posts) {
        //if (err) // TODO handle err
        
        posts.sort(function(a,b){
          return a.title > b.title ? 1 : -1;
        });

        console.log("sessionHeader", cks.userSession);

        res.write(fn({
          posts : posts,
          sessionHeader : cks.userSession
        }));

        res.end();
      });


    }else{

      var body = "";
      req.on('data', function (chunk) {
        body += chunk;
      });

      req.on('end', function () {
        var jsonResponse = querystring.parse(body), post = null;

        if(!jsonResponse.isUpdating){
          post = new Post.model({
            "title": jsonResponse.title,
            "content": jsonResponse.content,
            "link": "http://www.google.com"
          });
          post.save();

          res.writeHead(302, {
            'Location': '/posts'
            //add other headers here...
          });
          res.end();
        }else{

          Post.model.findById(jsonResponse.idToUpdate, function(err, doc){
            doc.title = jsonResponse.title;
            doc.content = jsonResponse.content;
            doc.save();

            res.writeHead(302, {
              'Location': '/posts'
              //add other headers here...
            });
            res.end();
          });

        }

      });

    }

  }else if(req.url.indexOf("/delete") > -1 ){

    req.on('end', function () {

      var id = req.url.split('delete/')[1]; 
      console.log("Do you want to delete? " + id);   

      if(Post.model.findByIdAndRemove(id).remove()){
        console.log("It was deleted!");
      }

      res.writeHead(302, {
        'Location': '/posts'
        //add other headers here...
      });
      res.end();

    });

  }else if(req.url.indexOf("/update") > -1 ){

    res.writeHead(200, {'Content-Type': 'text/html'});
   
    var pageString = fs.readFileSync('./views/update.jade'),
      fn = jade.compile(pageString, {}),
      id = req.url.split('update/')[1]; 

    Post.model.findById(id, function (err, post) {
      
      res.write(fn({
        post: post
      }));
      res.end();
    });

  }else if(req.url === "/create"){

    res.writeHead(200, {'Content-Type': 'text/html'});

    var pageString = fs.readFileSync('./views/create.jade'),
      fn = jade.compile(pageString, {});

    res.write(fn({
      //properties to the view
    }));

    res.end();

  }else if(req.url === "/logout"){   
    res.setHeader("Set-Cookie", ["userSession="]);
    res.writeHead(302, {
      'Location': '/posts'
    });
    res.end();
  }else if(req.url === "/login"){   

    if(req.method === "POST"){
      //res.writeHead(200, {'Content-Type': 'text/html'});
      var body = "";
      req.on('data', function (chunk) {
        body += chunk;
      });

      req.on('end', function () {
        var jsonData = querystring.parse(body);
        if(jsonData.username.toLowerCase() === 'nico'){
          if(jsonData.password.toLowerCase() === 'admin'){    
            console.log('LOGGED', res.getHeader('session'));
            res.setHeader("Set-Cookie", ["userSession=nico"]);
            res.writeHead(302, {
              'Location': '/posts'
              //add other headers here...
            });
            res.end();
          }
        }

      });

    }else{
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end();      
    }

  }else{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();
  }

};

module.exports = router;