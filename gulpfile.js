
const gulp = require('gulp'),
    connect = require('gulp-connect'),
    fileinclude = require('gulp-file-include');

function buildFile(cb) {
    gulp.src(['./src/*.html'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: './src/_include',

        }))
        .pipe(gulp.dest('./dist'))
        .pipe(connect.reload());
    cb()
}
gulp.task('build', buildFile);

gulp.task('server', function (cb) {
    connect.server({
        root: 'dist',
        livereload: true,
    });
    cb()
});

gulp.task('watch', function (cb) {
    gulp.watch('src/**/*.html', gulp.series(buildFile));
    cb()
});


gulp.task('live', gulp.parallel('server', 'watch'));