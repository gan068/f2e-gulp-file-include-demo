gulp = require("gulp");
gulpLoadPlugins = require("gulp-load-plugins");
$ = gulpLoadPlugins();
$.path = require("path");
$.connect = require("gulp-connect");
$.config = require("gulp-data");
$.twig = require("gulp-twig");
$.del = require("del");
$.sass = require("gulp-sass");
$.browsersync = require("browser-sync");
$.plumber = require("gulp-plumber");
$.eslint = require("gulp-eslint");
$.notify = require("gulp-notify");
$.fs = require("fs");

function cleanDist(cb) {
  $.del(["dist/**/*", "!dist/.gitkeep"]);
  cb();
}
function buildTwig(cb) {
  gulp
    .src(["./src/**/*.twig"])
    .pipe(
      $.plumber({
        handleError: function(err) {
          console.log(err);
          this.emit("end");
        }
      })
    )
    .pipe(
      $.config(function(file) {
        return JSON.parse($.fs.readFileSync("./config.json"));
      })
    )
    .pipe($.twig())
    .on("error", function(err) {
      process.stderr.write(err.message + "\n");
      this.emit("end");
    })
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
  return (
    gulp
      .src(["./src/**/*.js", "./gulpfile.js"])
      //.pipe($.plumber())
      .pipe($.eslint("./eslint.json"))
      .pipe($.eslint.format())
      .on("error", function(err) {
        process.stderr.write(err.message + "\n");
        this.emit("end");
      })
      .pipe($.eslint.failAfterError())
  );
  //
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

gulp.task("build", gulp.parallel([buildTwig, buildJs, buildSass, copyFile]));
gulp.task("clean-dist", cleanDist);
gulp.task("js-lint", jsLint);

// BrowserSync Reload
function browserSyncReload(cb) {
  $.browsersync.reload();
  cb();
}

gulp.task("server", browserSync);

gulp.task("watch", function(cb) {
  gulp.watch(["src/**/*.twig", "config.json"], gulp.series(buildTwig));
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
