const gulp = require('gulp');
const babel = require('gulp-babel');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');
const jshint = require('gulp-jshint');
const gulpjasmine = require('gulp-jasmine');


gulp.task('default', callback => {
  runSequence(
      'lint',
      'transpile',
      'test',
      'load',
      callback);
});

gulp.task('debug', callback => {
  runSequence(
      'transpile',
      'load',
      callback);
});

gulp.task('load', () => {
  return gulp
    .src('')
    .pipe(shell([
          'node discord_dj/js/src/bot.js'
    ]));
});

gulp.task('transpile', () => {
  return gulp.src('discord_dj/es6/src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('discord_dj/js/src/'));
});

gulp.task('lint', () => {
  return gulp.src('./discord_dj/src/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('jasmine', () => {
  return gulp.src('discord_dj/es6/test/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('discord_dj/js/test/'))
    .pipe(gulpjasmine());
});

gulp.task('test', callback => {
  runSequence(
  'lint',
  'jasmine',
  callback);
});
