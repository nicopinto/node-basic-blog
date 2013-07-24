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

  if(fs.existsSync('./' + req.url)){
    var extension = req.url.substr(req.url.lastIndexOf('.') + 1),
      contentType = mimetypes[extension];
    if(contentType){
        res.writeHeader(200, {'Content-Type': contentType});  
    }else{
      res.writeHeader(200, {'Content-Type': 'text/plain'});
    }
    var fileString = fs.readFileSync('./' + req.url);
        res.write(fileString);  
    res.end();
  }

  var is3Multiplo = function (num){
    var result = num / 3,
      isInt = result % 1 === 0;
    return isInt;
  };
    
  if(req.url === "/posts"){

    if(req.method === "GET"){
      //res.writeHead(200, {'Content-Type': 'application/json'});
      res.writeHead(200, {'Content-Type': 'text/html'});

      var layoutString = fs.readFileSync('./views/posts.jade'),
        posts = fs.readFileSync('./data/posts.json'),
        fn = jade.compile(layoutString, {});


      Post.model.find(function (err, posts) {
        //if (err) // TODO handle err
        posts.sort(function(a,b){
          return a.title > b.title ? 1 : -1;
        });

        res.write(fn({
          posts: posts//eval('(' + posts + ')')
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

  }else if(req.url === "/data"){    
    res.writeHead(200, {'Content-Type': 'text/html'});

    res.end();
  }else{
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end();
  }

};

module.exports = router;