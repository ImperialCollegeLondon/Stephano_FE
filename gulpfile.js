var gulp = require('gulp');
var uglify = require('gulp-uglify');
var less = require('gulp-less');
var minifyCSS = require('gulp-minify-css');
var rename = require('gulp-rename');
var concat = require('gulp-concat');

gulp.task('js', function() {
  return gulp.src(['./app/js/**/*.js'])
      .pipe(concat('stephano.js'))
      //.pipe(uglify())
      .pipe(gulp.dest('./dist/js/'));
});

gulp.task('less', function() {
  return gulp.src('./app/css/main.less')
        .pipe(less())
        .pipe(minifyCSS())
        .pipe(rename('stephano.css'))
        .pipe(gulp.dest('./dist/css/'));
});

gulp.task('watch', function () {
  gulp.watch('./app/js/**/*.js', ['js']);
  gulp.watch('./app/css/**/*.less', ['less']);

});

gulp.task('build', ['js', 'less']);
gulp.task('default', ['watch', 'js', 'less']);
