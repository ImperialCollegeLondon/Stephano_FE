var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var reactify = require('reactify');
var htmlMinifier = require('gulp-html-minifier');
var uglify = require('gulp-uglify');
var stripDebug = require('gulp-strip-debug');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');

gulp.task('browserify', function () {
  return browserify('./private/js/stephano.js')
        .transform(reactify)
        .bundle()
        .pipe(source('stephano.js'))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(stripDebug())
        .pipe(rename('snapterest.js'))
        .pipe(gulp.dest('./public/js'));
});

gulp.task('less', function() {
  return gulp.src('./private/less/main.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(rename('snapterest.css'))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('watch', function () {
  gulp.watch('./private/js/**/*.js', ['browserify']);
  gulp.watch('./private/less/**/*.less', ['less']);

});

gulp.task('build', ['browserify', 'less']);
gulp.task('default', ['watch', 'browserify', 'less']);
