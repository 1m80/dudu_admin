var gulp = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload');

var path = {
    scripts: ['src/scripts/**/*.js'],
    styles: ['src/styles/*.css'],
    images: ['src/images/**']
}
gulp.task('styles', function() {
    return gulp.src(path.styles)
        .pipe(autoprefixer('last 2 version', 'a prefixer'))
        .pipe(gulp.dest('dist/css'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
        .pipe(notify({ message: 'Styles task complete' }));
})

gulp.task('scripts', function() {
    return gulp.src(path.scripts)
        //.pipe(jshint('.jshintrc'))
        //.pipe(notify({ message: 'jshintrc complete' }))
        //.pipe(jshint.reporter('default'))
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/js'))
        //.pipe(rename({suffix: '.min'}))
        //.pipe(uglify())
        //.pipe(gulp.dest('dist/assets/js'))
        .pipe(notify({ message: 'Scripts task complete' }));
});

gulp.task('images', function() {
    return gulp.src(path.images)
        .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
        .pipe(gulp.dest('dist/img'))
        .pipe(notify({ message: 'Images task complete' }));
});

gulp.task('clean', function() {
    return gulp.src(['dist/css', 'dist/js', 'dist/img'], {read: false})
        .pipe(clean());
});

gulp.task('default', function() {
    gulp.start('scripts');
});

gulp.task('watch', function() {

    // 看守所有.css档
    gulp.watch(path.styles, ['styles']);

    // 看守所有.js档
    gulp.watch(path.scripts, ['scripts']);

    // 看守所有图片档
    gulp.watch(path.images, ['images']);

    livereload.listen();

    gulp.watch(['dist/**']).on('change', livereload.changed);

});
