const gulp = require('gulp');
const sass = require('gulp-sass');

gulp.task('build:scss', () => {
  return gulp.src('./src/scss/app.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'));
});

gulp.task('watch:scss', () => {
  gulp.watch('./src/scss/app.scss', ['build:scss']);
});

gulp.task('copy:fonts', () => {
  return gulp.src([
    './node_modules/font-awesome/fonts/*.+(eot|svg|ttf|woff|woff2|otf)',
    './node_modules/octicons/build/font/*.+(ttf|eot|svg|ttf|woff|woff2)',
  ])
  .pipe(gulp.dest('./dist/fonts'));
});

gulp.task('watch', ['watch:scss']);
gulp.task('build', ['copy:fonts', 'build:scss']);
