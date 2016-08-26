var assign = require('lodash.assign');
var babelify = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var gulp = require('gulp');
var gutil = require('gulp-util');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var uglify = require('gulp-uglify');
var watchify = require('watchify');

var options = {
  browserifyOpts: {
    entries: './src/js/app.js',
    debug: true
  },
  jsDest: 'dist/js'
};

var bundler = browserify(options.browserifyOpts);

gulp.task('build:js', function () {
  return bundler
    .transform(babelify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(options.jsDest));
});

gulp.task('watch:js', function () {
  var watcherOpts = assign({}, watchify.args, options.browserifyOpts);
  var watcher = watchify(browserify(watcherOpts)).transform(babelify);

  function bundle() {
    return watcher
      .bundle()
      // log errors if they happen
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source('app.js'))
      .pipe(buffer())
      .pipe(gulp.dest(options.jsDest));
  }

  watcher.on('update', bundle); // on any dep update, runs the bundler
  watcher.on('log', gutil.log); // output build logs to terminal

  return bundle();
});

gulp.task('build:scss', function () {
  return gulp.src('./src/scss/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch:scss', function () {
  gulp.watch('./src/scss/app.scss', ['build:scss']);
});

gulp.task('copy:fonts', function () {
  return gulp.src([
    './node_modules/font-awesome/fonts/*.+(eot|svg|ttf|woff|woff2|otf)',
    './node_modules/octicons/build/font/*.+(ttf|eot|svg|ttf|woff|woff2)',
  ])
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('apply-prod-environment', function() {
  process.env.NODE_ENV = 'production';
});

gulp.task('watch', ['watch:js', 'watch:scss']);
gulp.task('build', ['copy:fonts', 'build:js', 'build:scss']);
gulp.task('release', ['apply-prod-environment', 'build']);
gulp.task('default', ['build']);
