gulp = require("gulp");
gulpLoadPlugins = require("gulp-load-plugins");
$ = gulpLoadPlugins();

$.connect = require("gulp-connect");
$.fileInclude = require("gulp-file-include");
$.del = require("del");
$.sass = require("gulp-sass");
$.browsersync = require("browser-sync");
$.plumber = require("gulp-plumber");
$.eslint = require("gulp-eslint");
$.notify = require("gulp-notify");

function cleanDist(cb) {
  $.del(["dist/**/*", "!dist/.gitkeep"]);
  cb();
}
function buildFile(cb) {
  gulp
    .src(["./src/**/*.html"])
    .pipe($.plumber())
    .pipe(
      $.fileInclude({
        prefix: "@@",
        basepath: "./src"
      })
    )
    .pipe(gulp.dest("./dist"))
    .pipe($.browsersync.stream());
  cb();
}
function buildJs(cb) {
  gulp
    .src(["./src/**/*.js"])
    .pipe($.plumber())
    .pipe(gulp.dest("./dist"))
    .pipe($.browsersync.stream())
    .pipe($.notify("build js finished"));
  cb();
}
function buildSass(cb) {
  gulp
    .src(["./src/**/*.scss", "./src/**/*.css"])
    .pipe($.plumber())
    .pipe($.sass())
    .pipe(gulp.dest("./dist"))
    .pipe($.browsersync.stream())
    .pipe($.notify("build sass finished"));
  cb();
}
function copyFile(cb) {
  gulp
    .src([
      "./src/**/*.png",
      "./src/**/*.jpg",
      "./src/**/*.gif",
      "./src/**/*.webp",
      "./src/**/*.eot",
      "./src/**/*.svg",
      "./src/**/*.ttf",
      "./src/**/*.woff",
      "./src/**/*.woff2"
    ])
    .pipe(gulp.dest("./dist"))
    .pipe($.browsersync.stream());
  cb();
}

// Lint scripts
function jsLint() {
  return gulp
    .src(["./assets/js/**/*", "./gulpfile.js"])
    .pipe($.plumber())
    .pipe($.eslint("./eslint.json"))
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
}

// BrowserSync
function browserSync(cb) {
  $.browsersync.create();
  $.browsersync.init({
    server: {
      baseDir: "./dist/"
    },
    port: 3000
  });
  cb();
}

gulp.task("build", gulp.parallel([buildFile, buildJs, buildSass, copyFile]));
gulp.task("clean-dist", cleanDist);
gulp.task("js-lint", jsLint);

// BrowserSync Reload
function browserSyncReload(cb) {
  $.browsersync.reload();
  cb();
}

gulp.task("server", browserSync);

gulp.task("watch", function(cb) {
  gulp.watch(["src/**/*.html"], gulp.series(buildFile));
  gulp.watch(["./src/**/*.scss", "./src/**/*.css"], buildSass);
  gulp.watch(["./src/**/*.js"], gulp.series([jsLint, buildJs]));
  gulp.watch(
    [
      "./src/**/*.png",
      "./src/**/*.jpg",
      "./src/**/*.gif",
      "./src/**/*.svg",
      "./src/**/*.webp"
    ],
    copyFile
  );
  gulp.series(browserSyncReload);
  cb();
});

gulp.task(
  "live",
  gulp.series(
    "clean-dist",
    "js-lint",
    "build",
    gulp.parallel("server", "watch")
  )
);
