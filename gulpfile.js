const gulp = require('gulp');
const babel = require('gulp-babel');
const runSequence = require('run-sequence');
const shell = require('gulp-shell');


gulp.task('default', callback => {
  runSequence(
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
