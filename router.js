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
        //console.log(posts)
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
        var jsonResponse = querystring.parse(body),
            new_post = new Post.model({
              "guid":000,
              "title": jsonResponse.title,
              "content": jsonResponse.content,
              "link": "http://www.google.com"
            });

        new_post.save();

        //res.writeHead(200, {'Content-Type': 'application/json'});
        //res.write(JSON.stringify(jsonResponse));

        res.writeHead(302, {
          'Location': '/posts'
          //add other headers here...
        });
        res.end();

      });

    }

    /*}else if(req.url === "/data"){
    var post_1 = new Post.model({
      "guid":7,
      "title": "Post Title 7",
      "content": "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.",
      "link": "http://www.google.com"
    }),
    post_2 = new Post.model({
      "guid":8,
      "title": "Post Title 8",
      "content": "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.",
      "link": "http://www.google.com"
    }),
    post_3 = new Post.model({
      "guid":9,
      "title": "Post Title 9",
      "content": "Donec id elit non mi porta gravida at eget metus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.",
      "link": "http://www.google.com"
    });

    post_1.save();
    post_2.save();
    post_3.save();

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<h1>Data Loaded!</h1>');
    res.end();*/

  }else if(req.url === "/create"){

    res.writeHead(200, {'Content-Type': 'text/html'});

    var pageString = fs.readFileSync('./views/create.jade'),
      //posts = fs.readFileSync('./data/posts.json'),
      fn = jade.compile(pageString, {});

    //res.write(stringify(data));
    //res.write(layoutString);

    res.write(fn({
      
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