/**
 * @description gulp配置文件，整合css/js/images等自动化插件
 * @author huanghui
 * @date 20160808
 */
var gulp = require('gulp'),                     //本地安装gulp所用到的地方
    less = require('gulp-less'),                //less文件转为css
    autoprefixer = require('gulp-autoprefixer'),//css添加厂商前缀
    rename = require('gulp-rename'),            //重命名
    cssmin = require('gulp-clean-css'),         //压缩css
    watch = require('gulp-watch'),              //即时编译
    assetRev = require('gulp-chsi-rev'),      //添加版本号
    concat = require('gulp-concat'),            //js合并
    uglify = require('gulp-uglify'),            //js压缩
    clean = require('gulp-clean'),              //删除文件，做操作前先删除文件
    imgmin = require('gulp-imagemin'),          //图片压缩
    tmodjs = require('gulp-tmod'),              //template模板构建
    fileinclude = require('gulp-file-include'), //html文件直接include
    htmlmin = require('gulp-htmlmin'),          //html文件压缩
    postcss = require('gulp-postcss'),            //css转化
    px2rem = require('postcss-px2rem'),          //将px转为rem
    header = require('gulp-header'),             //layer添加版本号
    copydir = require('copy-dir'),               //拷贝目录
    del = require('del');                        //layer删除文件

var colors = require('colors'); //彩色显示

var gulp_connect = require('gulp-connect');      //本地化-简单的web server

var ArrAll = {
    lessDir : 'src/css/',  //less文件目录
    wapLessDir : 'src/css/wap/*.less',
    cssMin : 'css' , //压缩后的min.css目录
    jsSrc : 'src/js/',     //js文件目录
    jsMin : 'js',    //压缩后的min.js目录
    imgSrc : 'src/images/**/*.{png,jpg,gif,ico}',   //原图片路径
    imgMin: 'images',   //图片生成路径 
    htmlTj : 'src/tj/',
    tj : 'tj', 
    htmlTjyx : 'src/tjyx/',   
    tjyx : 'tjyx',  
    templateDir: 'template/**/*.html',
    templateSrc: 'src/js',
    layer_componentsDir: 'js/components/layer', //插件路径
    iscroll_componentsDir: 'js/components/iscroll'
};  

/**
 * layer插件处理
 * @author yxl
 * @date 2016/11/30
 */
gulp.task('layer_css',function(){
    gulp.src('src/components/layer/**/*.css')
    .pipe(cssmin())
    .pipe(gulp.dest(ArrAll.layer_componentsDir));
})
gulp.task('layer_js',function(){
    gulp.src('src/components/layer/layer.js').pipe(uglify({mangle:false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(ArrAll.layer_componentsDir));
})
gulp.task('layer_img',function(){
    gulp.src('src/components/layer/**/*.{png,gif}').pipe(rename({}))
    .pipe(gulp.dest(ArrAll.layer_componentsDir));
})
gulp.task('layer',function(){
     gulp.start(['layer_css', 'layer_img','layer_js']);
})
gulp.task('iscroll',function(){
    gulp.src('src/components/iscroll/*.js')
    .pipe(concat('iscroll.js'))
    .pipe(uglify({mangle:false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(ArrAll.iscroll_componentsDir));
})
/**
 * template模板构建，生成到src目录中
 * @author huangh@chsi.com.cn
 * @date 20161121
 */
gulp.task('template', function(){
    var stream = gulp.src(ArrAll.templateDir)
            .pipe(tmodjs({
                output:"src/js/",
                templateBase:"./template",
                "helpers": "./template/helper.js"
            }))
            .pipe(gulp.dest(ArrAll.templateSrc));
            return stream;
}); 

var LessToCss = [ArrAll.lessDir+"*.less","!"+ArrAll.lessDir+"_*.less"];
/**
 * 将less转化为css、加厂商前缀、css文件中链接加入版本号、重命名和压缩等
 * @author：huangh@chsi.com.cn 
 * @date：20161121
 **/
gulp.task('LesstoCss', function () {
    gulp.src(LessToCss) //该任务针对的文件和不对其进行处理的文件
        .pipe(less())                      //将less转化为css
        .pipe(autoprefixer({               //加厂商前缀
            browsers: ['Android 2.3','Android >= 4','iOS >= 6',
              'Explorer >= 6','Chrome >= 20','Firefox >= 24','Opera >= 12'],
            cascade: true,                  //是否美化属性值 默认：true 
            remove:true                     //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(assetRev())                   //给css中的链接添加版本号 a.img?v=date
        .pipe(gulp.dest(ArrAll.cssMin))     //生成css文件，less放到css源目录中，然后在同一压缩
        .pipe(rename({ suffix: '.min' }))   //重新命名，添加后缀名
        .pipe(cssmin())                     //压缩css
        .pipe(gulp.dest(ArrAll.cssMin)); //生成压缩文件
});
/**
 * 移动端样式，将less转化为css、加厂商前缀、css文件中链接加入版本号、px转为rem、重命名和压缩等
 * @author：huangh@chsi.com.cn 
 * @date：20161121
 **/
gulp.task('WapLesstoCss', function () {
    gulp.src(ArrAll.wapLessDir) //该任务针对的文件和不对其进行处理的文件
        .pipe(less())                      //将less转化为css
        .pipe(autoprefixer({               //加厂商前缀
            browsers: ['Android 2.3','Android >= 4','iOS >= 6',
              'Explorer >= 6','Chrome >= 20','Firefox >= 24','Opera >= 12'],
            cascade: true,                  //是否美化属性值 默认：true 
            remove:true                     //是否去掉不必要的前缀 默认：true 
        }))
        .pipe(assetRev())                   //给css中的链接添加版本号
        .pipe(postcss([px2rem({remUnit: 100})])) //px转为rem
        .pipe(gulp.dest(ArrAll.cssMin+'/wap'))     //生成css文件，less放到css源目录中，然后在同一压缩
        .pipe(rename({ suffix: '.min' }))   //重新命名，添加后缀名
        .pipe(cssmin())                     //压缩css
        .pipe(gulp.dest(ArrAll.cssMin+'/wap')); //生成压缩文件
});
/**
 * js压缩
 * @author：huangh@chsi.com.cn 
 * @date：20161118
 **/
gulp.task('jsMin',function(){
  gulp.src(ArrAll.jsSrc+'*.js')
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify({mangle:false}))
      .pipe(gulp.dest(ArrAll.jsMin));
});
/**
 * js合并，只有这三个js，但有顺序要求
 * @author：huangh@chsi.com.cn 
 * @date：20161121
 **/
var jsConcat = [ArrAll.jsSrc + 'template.js',ArrAll.jsSrc + 'mainfest.js',ArrAll.jsSrc + 'function.js'];
gulp.task('jsConcat',function(){
  gulp.src(jsConcat)
      .pipe(concat('main.js'))
      .pipe(gulp.dest(ArrAll.jsMin))
      .pipe(rename({ suffix: '.min' }))
      .pipe(uglify({mangle:false}))
      .pipe(gulp.dest(ArrAll.jsMin));
});

/**
 * 图片处理
 * @author：huangh@chsi.com.cn 
 * @date：20161121
 **/
gulp.task('imgMin',function(){
  gulp.src(ArrAll.imgSrc)
      .pipe(imgmin({
          optimizationLevel: 3, //类型：Number  默认：3  取值范围：0-7（优化等级）
          progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
          interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
          multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
      }))
      .pipe(gulp.dest(ArrAll.imgMin))
});

/*
 * html页面引用时加入版本号，两个方法调剂和调剂意向
 * @author：huangh@chsi.com.cn 
 * @date：20161121
 */
var tjSrc = [ArrAll.htmlTj+'**/*.html','!'+ArrAll.htmlTj+'**/_*.html']
gulp.task('htmlTj',function() {
    gulp.src(tjSrc)
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(htmlmin({
            collapseWhitespace : false ,            //压缩html
            collapseBooleanAttributes : true ,     //省略布尔值属性
            removeEmptyAttributes : true,          //删除所有空格的属性值
            removeScriptTypeAttributes : true ,    //删除script中的type='text/javascript'
            removeStyleLinkTypeAttributes : true,  //删除link中的tyle='text/css'
            minifyJs : true ,   //压缩页面js
            minifyCss : true    //压缩页面css
        }))
        .pipe(assetRev())
        .pipe(gulp.dest(ArrAll.tj));
});

var tjyxSrc = [ArrAll.htmlTjyx+'**/*.html','!'+ArrAll.htmlTjyx+'**/_*.html'];
gulp.task('htmlTjyx',function() {
    gulp.src(tjyxSrc)
        .pipe(fileinclude({
          prefix: '@@',
          basepath: '@file'
        }))
        .pipe(htmlmin({
            collapseWhitespace : false ,            //压缩html
            collapseBooleanAttributes : true ,     //省略布尔值属性
            removeEmptyAttributes : true,          //删除所有空格的属性值
            removeScriptTypeAttributes : true ,    //删除script中的type='text/javascript'
            removeStyleLinkTypeAttributes : true,  //删除link中的tyle='text/css'
            minifyJs : true ,   //压缩页面js
            minifyCss : true    //压缩页面css
        }))
        .pipe(assetRev())
        .pipe(gulp.dest(ArrAll.tjyx));
});

/**
 * @description：clean清空文件夹
 * @author：huangh@chsi.com.cn 
 * @date：20170306，解决项目之外文件的删除问题
 **/
gulp.task('clean',function(){
   return gulp.src([ArrAll.cssMin,ArrAll.jsMin,ArrAll.imgMin,ArrAll.tj,ArrAll.tjyx,'../assets','../tj','../tjyx'])
              .pipe(clean({force: true}));
});

/**
 * @description：即时编译文件文件
 * @author：huangh@chsi.com.cn 
 * @date：20161121
 **/
gulp.task('watch',function(){
  gulp.watch(ArrAll.templateDir,['template']);   //template模板生成
  gulp.watch(LessToCss,['LesstoCss']);   //less解析为css，并进行优化处理
  gulp.watch(ArrAll.wapLessDir,['WapLesstoCss']);
  gulp.watch(ArrAll.imgSrc,['imgMin']);
  gulp.watch(ArrAll.jsSrc + '*.js',['jsMin']);
  gulp.watch(jsConcat,['jsConcat']); 
  gulp.watch(tjSrc,['htmlTj']); 
  gulp.watch(tjyxSrc,['htmlTjyx']); 
});

/**
 * @description：建立本地化http server
 * @author：weij@chsi.com.cn 
 * @date：20161206
 **/
gulp.task('server',function(){
  gulp_connect.server({
    port:8080,
    livereload:true,
    root:['.','.']
  });
});
/**
 * @description：默认任务，先执行所有任务，在即时监控所有任务
 * @author：huangh@chsi.com.cn 
 * @date：20160804
 **/
gulp.task('default',['clean'],function(){
  gulp.start(['iscroll','layer','template', 'LesstoCss','WapLesstoCss', 'imgMin',
    'jsMin','jsConcat','htmlTj','htmlTjyx','server','watch']);
});

// 构建任务：生成prodcut环境下的js/css/images 拷贝到上级目录
var path = require('path');

gulp.task('build',function(){
  console.log("--------开始拷贝部署的静态文件-------".green);

  copydir("./js", "../assets/js",function(stat, filepath, filename){
    //console.log("stat:"+stat+",--filepath:"+filepath+",--filename:"+filename);
    if(stat== 'file' && (filename == "mainfest.min.js" || filename =="main.js" || filename == "function.min.js" || filename =="template.min.js")){
      //console.log('删除？filename:'+filename);
      return false;
    }
    return true;
  },function(error){ console.log("js包拷贝成功！")});
  copydir("./css", "../assets/css",function(error){ console.log("css包已拷贝成功！")});
  copydir("./images", "../assets/images",function(error){ console.log("images已拷贝成功！")});
  
  copydir("./tj", "../tj",function(error){ console.log("tj包拷贝成功！")});
  copydir("./tjyx", "../tjyx",function(error){ console.log("tjyx包包括成功！")});
  console.log("--------可部署的静态文件已就绪-------".green);
})

