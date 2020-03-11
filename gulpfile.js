const fileinclude = require('gulp-file-include');
const gulp = require('gulp');

gulp.task('fileinclude', async function() {
  await gulp.src(['./src/*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: './src/_include',

    }))
    .pipe(gulp.dest('./dist'));
});
