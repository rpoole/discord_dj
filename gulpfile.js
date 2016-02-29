const gulp = require('gulp');
const babel = require('gulp-babel');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');
const jshint = require('gulp-jshint');
const gulpjasmine = require('gulp-jasmine');
const istanbul = require('gulp-istanbul');

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
  return gulp.src('./discord_dj/es6/src/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('default'))
  .pipe(jshint.reporter('fail'));
});

gulp.task('transpile-tests', () => {
  return gulp
    .src('discord_dj/es6/test/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('discord_dj/js/test/'));
});

gulp.task('jasmine', ['transpile', 'transpile-tests'], () => {
  return gulp
    .src('discord_dj/js/test/**/*.js')
    .pipe(gulpjasmine());
});

gulp.task('cover', ['transpile', 'transpile-tests'], () => {
  return gulp
    .src(['discord_dj/js/src/**/*.js'])
    .pipe(istanbul({
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire());
});

gulp.task('coverage', ['cover'], () => {
  return gulp
    .src('discord_dj/js/test/**/*.js')
    .pipe(gulpjasmine())
    .pipe(istanbul.writeReports());
});

gulp.task('test', callback => {
  runSequence(
      'lint',
      'jasmine',
      callback);
});
