var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var babel = require('gulp-babel');

var paths = {
  scripts: 'js/**/*.js',
  scss: 'scss/**/*.scss'
};

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use any package available on npm
gulp.task('cleanJS', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['build/js']);
});

gulp.task('cleanSCSS', function() {
  // You can use multiple globbing patterns as you would with `gulp.src`
  return del(['build/scss']);
});

gulp.task('scripts', ['cleanJS'], function() {
  // Minify and copy all JavaScript (except vendor scripts)
  // with sourcemaps all the way down
  return gulp.src(paths.scripts)
    .pipe(babel({presets: ['es2015']}))
    .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('build/js'))
    .pipe(browserSync.stream());
});

gulp.task('scss', ['cleanSCSS'], function () {
  return gulp.src(paths.scss)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.stream());
});

// Rerun the task when a file changes
gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('scss:watch', function () {
  gulp.watch(paths.scss, ['scss']);
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', ['watch', 'scripts', 'scss', 'scss:watch', 'browser-sync']);
