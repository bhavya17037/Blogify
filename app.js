var express = require('express');
var app = express();
var bodyparser = require('body-parser');
var mongoose = require('mongoose');
var helpers = require('express-helpers');
var current_user = "";

helpers(app);

app.set('view engine','ejs');

var urlencodedparser = bodyparser.urlencoded({extended: false});
mongoose.connect("mongodb://localhost/blog_users");

var schema = mongoose.Schema;

var userschema = new schema({
    username: String,
    password: String,
    blogs: [String],
    titles: [String]
});

var user = mongoose.model('USER',userschema);

app.use("/css",express.static(__dirname + '/public'));

app.get("/start",function(req,res){
    res.render("start.ejs");
});

app.get("/login",function(req,res){
    res.render("login.ejs");
});

app.get("/signup",function(req,res){
    res.render("sign_up.ejs");
});

app.get("/content/:tits",function(req,res){
    user.findOne({username: current_user},function(err,doc){
        if(err){
            throw err;
        }
        var BLOGS = doc.blogs;
        var number = BLOGS.length;
        var T = doc.titles;
        console.log(T);
        for(var i = 0; i < number; i++){
            if(req.params.tits.slice(1) == T[i]){
                console.log("YEAH");
                res.render("blog_content.ejs",{Blog: BLOGS[i],Title: T[i]});
            }
        }
    });
});

app.get("/userhome",function(req,res){
    user.findOne({username: current_user},function(err,doc){
        console.log(doc);
        var T = doc.titles;
        var number = T.length;
        console.log(T);
        console.log(doc.blogs);
        res.render("user_home.ejs",{Titles: T,NUM: number});
    });
});

app.get('/addBlog',function(req,res){
    res.render("add_blog.ejs");
});

app.get("/alreadyexists",function(req,res){
    res.render("Already_exists.ejs");
});

app.get("/nouserfound",function(req,res){
    res.render("nofound.ejs");
});


app.post("/newblogpost",urlencodedparser,function(req,res){
    console.log("reached");
    var U = current_user;
    var T = req.body.Title;
    var blog_cont = req.body.blog_content;
    user.findOne({username: U},function(err,doc){
        if(err){
            throw err;
        }else{
            console.log("here also");
            doc.blogs.push(blog_cont);
            doc.titles.push(T);
            doc.save(function(req,res){
                if(err){
                    throw err;
                }
            });
            return res.redirect("/userhome");
        }
    });
});

app.post("/signuppost",urlencodedparser,function(req,res){
    var USERNAME = req.body.username.toString();
    var PASS = req.body.password.toString();
    user.find({username: USERNAME,password: PASS},function(err,docs){
        if(docs.length != 0){
            return res.redirect("/alreadyexists");
        }else{
            var newuser = new user({
                username: USERNAME,
                password: PASS,
                blogs: [],
                titles: []
            });
            
            newuser.save(function(err){
                if(err){
                    throw err;
                    current_user = "";
                }else{
                    console.log("Successfully signed up!");
                }
            });
            current_user = newuser.username;
            return res.redirect("/userhome");
        }
    });
});

app.post("/loginpost",urlencodedparser,function(req,res){
    var USERNAME = req.body.username.toString();
    var PASS = req.body.password.toString();
    user.find({username: USERNAME, password: PASS},function(err,docs){
        if(err){
            throw err;
            current_user = "";
        }
        if(docs.length >= 1){
            current_user = req.body.username;
            return res.redirect("/userhome");    
        }else{
            current_user = "";
            return res.redirect("/nouserfound");
        }
    });
});




app.listen(3000);