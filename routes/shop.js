var router = require('express').Router();

//미들웨어 - 로그인 후 세션이 있으면 req.user가 항상 있음
function checkLogin(req, res, next){
    if(req.user){
        next();
    }else{
        res.send('로그인 안하셨는데요?');
    }
}

//모든 URL에 적용할 미들웨어 
router.use(checkLogin); 
//router.use('/shirts',checkLogin); //특정 url(shirts)에만 접속할 때 

router.get('/shirts', function(req,res){
    res.send('셔츠 파는 페이지입니다.');
});

router.get('/pants', function(req,res){
    res.send('바지 파는 페이지입니다.');
}); 

module.exports = router; //js파일을 다른 파일에서 쓰고 싶을때 (exports)