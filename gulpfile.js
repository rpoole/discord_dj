const gulp = require('gulp');
const babel = require('gulp-babel');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');
const jshint = require('gulp-jshint');


gulp.task('default', callback => {
  runSequence(
      'lint',
      'transpile',
      'load',
      callback);
});

gulp.task('load', () => {
  return gulp
    .src('')
    .pipe(shell([
          'node discord_dj/out/bot.js',
    ]));
});

gulp.task('transpile', () => {
  return gulp.src('discord_dj/src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
  .pipe(gulp.dest('discord_dj/out/'))
});

gulp.task('lint', () => {
  return gulp.src('./discord_dj/src/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'));
});
