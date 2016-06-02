var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');

gulp.task('build-js', function () {
  return browserify({entries: './src/js/app.js', extensions: ['.js'], debug: true})
		.transform(babelify)
		.bundle()
		.pipe(source('app.js'))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('watch-js', ['build-js'], function () {
  gulp.watch('./src/js/**/*.js', ['build-js']);
});

gulp.task('build-scss', function () {
  return gulp.src('./src/scss/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch-scss', ['build-scss'], function () {
  gulp.watch('./src/scss/app.scss', ['build-scss']);
});

gulp.task('build', ['build-js', 'build-scss']);
gulp.task('watch', ['watch-js', 'watch-scss']);
gulp.task('default', ['build']);
