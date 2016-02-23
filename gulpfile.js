const gulp = require('gulp');
const babel = require('gulp-babel');

gulp.task('default', () => {
  gulp.src('discord_dj/src/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
  .pipe(gulp.dest('discord_dj/out/'))
});
