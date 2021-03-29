const express = require('express')
const bodyParser = require('body-parser');
const multiparty = require('connect-multiparty'); //在处理模块中引入第三方解析模块
const path = require('path');
const fs = require('fs');

const load = require('audio-loader')
var multipartyMiddleware = multiparty();

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// const cors = require('cors')
// app.use(cors());

app.use(express.static(path.join(__dirname, '../dist')))
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:7777");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});


const mongoose = require('mongoose')
//连接mongo 并且使用musichouse这个数据库
const DB_URL = 'mongodb://localhost:27017/blancamusic'
mongoose.connect(DB_URL)
mongoose.connection.on('connected', function () {
  console.log(`成功连接${DB_URL}`)
})
const musiclist = mongoose.model('musiclist', new mongoose.Schema({
  song: { type: String },
  singer: { type: String },
  duration: { type: Number },
  imagesrc: { type: String },
  audiosrc: { type: String },
  album: { type: String },

}))

// musiclist.create({
//   song: '倒数',
//   singer: '邓紫棋',
//   duration: 278,
//   imagesrc: "../image/daoshu.png",
//   audiosrc: "../audio/daoshu.mp3",
// },function(err,doc){
//   if(!err){
//     console.log(doc)
//   }else{
//     console.log(err)
//   }
// })

// User.remove({age:20},function(err,doc){
//   console.log(doc)
// })
// User.update({name:'xiaoming'},{$set:{age:14}},function(err,doc){
//   console.log(doc)
// })
// app.post('/test', function (req, res) {
//   console.log(req.body)
// })

app.post('/addmusic', multipartyMiddleware, function (req, res) {
  // console.log(req)
  // console.log();
  let audioExtension = req.files.audio.name.substring(req.files.audio.name.lastIndexOf("."))
  let imageExtension = req.files.image.name.substring(req.files.image.name.lastIndexOf("."))
  // res.json(req.body)
  let audioName = new Date().getTime()
  let imageName = new Date().getTime()
  let audioReader = fs.createReadStream(req.files.audio.path);
  let imageReader = fs.createReadStream(req.files.image.path);
  let audioWriter = fs.createWriteStream(path.join(__dirname, '../src/audio', `${audioName}${audioExtension}`));
  let imageWriter = fs.createWriteStream(path.join(__dirname, '../src/image', `${imageName}${imageExtension}`));
  imageReader.pipe(imageWriter);
  
  load(req.files.audio.path).then(function (filemsg) {
    // console.log(parseInt(res.duration))
    audioReader.pipe(audioWriter);
    audioReader.on('end', function () {
      console.log('上传成功')
      musiclist.create({
        song: req.body.song,
        singer: req.body.singer,
        duration: parseInt(filemsg.duration),
        imagesrc: `../image/${imageName}${imageExtension}`,
        audiosrc: `../audio/${audioName}${audioExtension}`,
        album: req.body.album,
      }, function (err, doc) {
        if (!err) {
          console.log('数据库更新成功')
          res.status(200).send('succ')
        } else {
          console.log('数据库更新失败', err)
          res.status(413).send('err')
        }
      })
    });
    audioReader.on('error', function (err) {
      console.log('服务器读取audio失败')
      res.status(500).send('audioerr')

    });
  });
})
app.get('/getMusiclist', function (req, res) {
  // musiclist.find()
  musiclist.find({},function(err,doc){
    res.send(doc)
  })
})

app.listen(1777, function () {
  console.log('node app start at port 1777')
})