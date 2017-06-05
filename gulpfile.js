// fix for autoprefixer
//require('es6-promise')
//    .polyfill();

// Plugins
var
//autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    combineMq = require('gulp-combine-mq'),
    concat = require('gulp-concat'),
    connect = require('gulp-connect'),
    connectPhp = require('gulp-connect-php'),
    copy = require('gulp-copy'),
    //extChange = require('gulp-extension-change'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    handlebars = require('gulp-compile-handlebars'),
    imagemin = require('gulp-imagemin'),
    notify = require('gulp-notify'),
    //pixrem = require('gulp-pixrem'),
    plumber = require('gulp-plumber'),
    put = require('gulp-put'),
    reload = browserSync.reload,
    rename = require('gulp-rename'),
    //replace = require('gulp-replace'),
    sass = require('gulp-sass'),
    sassGlob = require('gulp-sass-glob'),
    //sourcemaps = require('gulp-sourcemaps'),
    watch = require('gulp-watch');


var paths = {
    input: {
        dir: './',
        all: [
            'images/*.{png,jpg,jpeg,gif,svg}',
            'css/*.css',
            'js/*.js',
            '*.html'
        ],
        css: 'css',
        handlebarsPartials: 'partials',
        handlebars: '**/*.hbs',
        html: '*.html',
        images: 'images/*.{png,jpg,jpeg,gif,svg}',
        js: [
            'bower_components/jquery/dist/jquery.js',
            'js/concat/functions.js'
        ],
        sass: 'sass/**/*.scss',
        svg: 'images/*.svg'
    },
    output: {
        dir: '',
        css: 'css',
        images: 'images/',
        js: 'js'
    },
    copy: {
        files: [
            'images/*.{png,jpg,jpeg,gif,svg}',
            'css/*.css',
            'js/*.js',
            '*.html'
        ],
        dir: '../dist/'
    }
}


// PLUGIN OPTIONS
var sassOptions = {
    errLogToConsole: true,
    includePaths: [
'bower_components/susy/sass',
'bower_components/breakpoint-sass/stylesheets',
'bower_components/normalize-css/'],
    outputStyle: 'expanded',
};
var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 1%', 'ie 8', 'ie 9']
};
var combineMqOptions = {
    beautify: true
};
var sourceMapOptions = {
    loadMaps: true
}


// BEGIN TASKS
gulp.task('html', () => {
    //return gulp.src(paths.input.handlebarsPages)
    return gulp.src(paths.input.handlebars)
        .pipe(handlebars({}, {
            ignorePartials: true,
            batch: [paths.input.handlebarsPartials]
        }))
        .pipe(rename({
            extname: '.html'
        }))
        .pipe(gulp.dest(paths.output.dir))
        .pipe(reload({
            stream: true
        }));
});

gulp.task('styles', function () {
    return gulp.src(paths.input.sass)
        .pipe(sassGlob())
        .pipe(sass(sassOptions)
            .on('error', sass.logError))
        .pipe(combineMq(combineMqOptions))
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(gulp.dest(paths.output.css))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('images', function (done) {
    return gulp.src(paths.input.images)
        .pipe(imagemin())
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(gulp.dest(paths.output.images));
});

gulp.task('scripts', function () {
    return gulp.src(paths.input.js)
        .pipe(concat('scripts.js'))
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(gulp.dest(paths.output.js))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('copyToDist', function () {
    gulp.src(paths.copy.files)
        .pipe(plumber({
            errorHandler: notify.onError('Error: <%= error.message %>')
        }))
        .pipe(put(paths.copy.dir))
        //.pipe(gulp.dest(paths.copy.dir))
});


gulp.task('connect', function () {
    connect.server({
        root: './',
        livereload: true
    });
});

gulp.task('connectSync', ['connect'], function () {
    connectPhp.server({}, function () {
        browserSync({
            proxy: 'localhost:8000',
            open: {
                browser: 'Google Chrome'
            }
        });
    });

    gulp.watch(paths.input.handlebars).on('change', function () {
        browserSync.reload();
    });
    gulp.watch(paths.input.sass).on('change', function () {
        browserSync.reload();
    });
    gulp.watch(paths.input.js).on('change', function () {
        browserSync.reload();
    });
    gulp.watch(paths.input.images).on('change', function () {
        browserSync.reload();
    });
});

// run 'default' task before running watch
gulp.task('watch', function () {
    gulp.watch(paths.input.handlebars, ['html']);
    gulp.watch(paths.input.sass, ['styles']);
    gulp.watch(paths.input.js, ['scripts']);
    gulp.watch(paths.input.images, ['images']);
});

// Default task
gulp.task('dynamic', ['html', 'styles', 'images', 'scripts', 'connectSync', 'watch']);
gulp.task('default', ['dynamic']);
gulp.task('dist', ['copyToDist']);
