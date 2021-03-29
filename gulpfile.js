const { src, dest, series, watch, parallel } = require('gulp');
const htmlclean = require('gulp-htmlclean')
const imagemin = require('gulp-imagemin')
const uglify = require('gulp-uglify')
const stripdebug = require('gulp-strip-debug')
const concat = require("gulp-concat");
const less = require("gulp-less");
const postcss = require("gulp-postcss");//处理css
const autoprefixer = require("autoprefixer");//添加css前缀
const cssnano = require("cssnano");//压缩css
const connect = require("gulp-connect");
const folder = {
  src: "src/",
  dist: "dist/"
}
var devMode = process.env.NODE_ENV == "development";//	producation
console.log(process.env.NODE_ENV)
function htmldo(){
  return src(folder.src + 'index.html')
  .pipe(connect.reload())
  .pipe(htmlclean())//压缩html
  .pipe(dest(folder.dist))
}
function cssdo(){
  let options = [autoprefixer(),cssnano()]
  let stream = src(folder.src + 'css/*')
  .pipe(connect.reload())
  .pipe(less())
  .pipe(postcss(options))
  .pipe(dest(folder.dist + 'css/'))
  return stream
}
function jsdo(){
  let stream = src(folder.src + 'js/*')
  .pipe(connect.reload())
  .pipe(concat("main.js"))//合并js文件
  .pipe(stripdebug())//去除console和dubugger
  .pipe(uglify())//压缩js
  .pipe(dest(folder.dist + 'js/'))
  return stream
}
function ficodo(){
  return src(folder.src + 'favicon1.ico')
  .pipe(imagemin())//压缩图片
  .pipe(dest(folder.dist))
}
function imagedo(){
  return src(folder.src + 'image/*')
  .pipe(imagemin())//压缩图片
  .pipe(dest(folder.dist + 'image/'))
}
function icondo(){
  return src(folder.src + 'icon/*')
  .pipe(imagemin())//压缩图片
  .pipe(dest(folder.dist + 'icon/'))
}
function audiodo(){
  return src(folder.src + 'audio/*')
  .pipe(dest(folder.dist + 'audio/'))
}
function connectdo(){
  connect.server({
    port: 7777,
    livereload: true,
    root: 'dist'
  })//开启服务器
}
function watchdo(){
  watch(folder.src+'html/*',htmldo)
  watch(folder.src+'css/*',cssdo)
  watch(folder.src+'js/*',jsdo)
  watch(folder.src+'image/*',imagedo)
  watch(folder.src+'audio/*',audiodo)
}

exports.default = series(htmldo,cssdo,ficodo,imagedo,icondo,jsdo,audiodo,parallel(connectdo,watchdo))