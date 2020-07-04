var bodyParser = require('body-parser'),
methodOverride = require('method-override'),
mongoose       = require('mongoose'),
express        = require('express'),
passport       = require('passport'),
LocalStrategy  = require('passport-local'),
User           = require('./model/user.js'),
expressSanitizer=require('express-sanitizer'),
app            = express(),port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rest_blog_app', {useNewUrlParser:true});
app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.use(require('express-session')({
    secret:"my name is ankush",
    resave:false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var blogSchema = new mongoose.Schema({
    title:String,
    author:String,
    image:String,
    body:String,
    created: {type: Date, default: Date.now}
});
var Blog = mongoose.model('Blog', blogSchema);


app.get('/',function(req,res){
    res.redirect('/blogs');
});

app.get('/blogs',function(req,res){
    Blog.find({},function(err,plogs){
        if(err){
            console.log('error');
        } else {
            res.render('index', { blogs:plogs});
        }
    });
});

app.get('/blogs/new',function(req,res){
    res.render('new');
});

app.post('/blogs',function(req,res){
    Blog.create(req.body.blog,function(err,newBlog){
        if(err){
            res.render('new');
        }else {
            res.redirect('/blogs');
        }
    });
});

app.get('/blogs/:id',function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect('/blogs');
        }else {
            res.render('show',{blog: foundBlog});
        }
    });
});

app.get('/blogs/:id/edit',function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.redirect('/blogs');
        }else {
            res.render('edit',{blog: foundBlog});
        }
    });
});

app.put('/blogs/:id',function(req,res){
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect('/blogs');
        }else{
            res.redirect('/blogs/' + req.params.id);
        }
    });
});

app.delete('/blogs/:id',function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.send('SOMETHING WENT WRONG');
        }else{
            res.redirect('/blogs'); 
        }
    });
});

app.get('/register',function(req,res){
    res.render('register');
});

app.post('/register',function(req,res){
    var newUser = new User({username:req.body.username});
    User.register(newUser,req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate('local')(req,res,function(){
            res.redirect('/blogs');
        });
    }); 
});



app.listen(port,function(){
    console.log("Server Started Ankush..!!");
});