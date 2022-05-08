const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { devNull } = require('os');
app.use(bodyParser.urlencoded({extended:true}));
 
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));
 
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

var db; //어떤 database에 저장할 것인가 

// (pc, phone, phone2, ... -> 공유기) --> internet --> mongodb cluster
const MongoClient = require('mongodb').MongoClient; //mongodb연결 
MongoClient.connect('mongodb+srv://admin:1q2w3e4r@cluster0.njheh.mongodb.net/todoapp?retryWrites=true&w=majority', function(err, client){
    
    if(err){
        return console.log(err);
    }
    
    db = client.db('todoapp'); //todoapp이라는 db(폴더)에 연결

    // db.collection('post').insertOne({name:'Milkim1', _id : 31}, function(error,result){
    //     console.log('저장완료');
    // });

    //listen(서버를 오픈할 포트번호, function(){서버 오픈시 실행할 코드})
    app.listen(8080, function(){
        console.log('listening on 8080');
    });
})

app.get('/',function(req, res){
    res.render('index.ejs');
});

app.get('/write',function(req, res){
    res.render('write.ejs');
});

//body-parser lib설치하고 form으로 보낸 내용들 DB에 저장하기 
app.post('/add', function(req, res){
    res.send('complete!');
    //counter라는 이름을가진 file을 찾을 거다
    db.collection('counter').findOne({name:'postCount'}, function(error, result){
        console.log(result.totalPost);
        let sTotalPost = result.totalPost;

        //console.log(req.body.date);
        db.collection('post').insertOne({_id : sTotalPost+1, title : req.body.title, date : req.body.date}, function(error,result){
            console.log('저장완료');

            //.updateOne({어떤 데이터를 수정할지}{수정값},function(){})
            //update함수를 쓸 때는 operator를 써야함. (operater : $set,$inc,$rename...)
            db.collection('counter').updateOne({name:'postCount'},{ $inc : {totalPost:1} },function(error,result){
                if(error) return console.log(error);
            });
        });
    }); 
});

app.get('/list', function(req, res){
    
    //디비에 저장된 post라는 collection안의 모든 데이터를 꺼내주세요
    //post파일에 저장된 데이터를 가져오겠다.
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('list.ejs', {posts : result});
    }); 
 
})


app.delete('/delete',function(req,res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id); 
    db.collection('post').deleteOne(req.body, function(error,result){
        console.log('삭제완료');
        res.status(200).send({message : 'success!'});
    });
})

//parameter로 요청가능한 url만들기 
app.get('/detail/:id',function(req,res){
    db.collection('post').findOne({_id: parseInt(req.params.id)},function(error, result){
        console.log(result);
        res.render('detail.ejs', {data : result});
    })
})

app.get('/edit/:id',function(req,res){
    db.collection('post').findOne({_id: parseInt(req.params.id)},function(error, result){
        console.log(result);
        res.render('edit.ejs', {data : result});
    })
})

app.put('/edit',function(req,res){
    //form에 담긴 제목데이터, 날짜데이터를 가지고 db.collection에 업데이트함.
    db.collection('post').updateOne( {_id: parseInt(req.body.id)}, {$set : {title:req.body.title, date:req.body.date}},function(error,result){
        console.log('수정완료!');
        res.redirect('/list');
    })
})

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({secret:'secretNum', resave:true, saveUninitialized:false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req,res){
    res.render('login.ejs');       
});

app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail' //회원인증 실패시 fail경로감
}), function(req,res){
     res.redirect('/');       
});

app.get('/fail', function(req,res){
    alert('login fail');
})

//인증하는 방법은 Strategy라고 함
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false, //true로 변환시 func파라미터에 req값 넣어서 비교가능
  }, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
      if (에러) return done(에러) 
                        //done(서버에러,성공시사용자DB데이터,에러메세지)
      if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
      if (입력한비번 == 결과.pw) {
        return done(null, 결과)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  })
);

passport.serializeUser(function(user,done){
    done(null, user.id);
})
passport.deserializeUser(function(id, done){
    done(null,{});
})