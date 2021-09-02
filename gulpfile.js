const { src, dest, series, parallel, watch } = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const htmlmin = require('gulp-htmlmin');

const del = require('del');
const browserSync = require('browser-sync').create();

function buildSass() {
    let sourcemaps = true;

    if (process.env.NODE_ENV === 'production') {
        sourcemaps = false;
    }

    return src('./src/sass/main.scss', { sourcemaps })
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss())
        .pipe(dest('./dist/css'), { sourcemaps })
        .pipe(browserSync.stream());
}

function buildHtml() {
    return src('./src/index.html')
        .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
        .pipe(dest('./dist'));
}

function buildAssets() {
    return src('./images/*').pipe(dest('./dist/images'));
}

function clean(cb) {
    del('./dist/**/*');
    cb();
}

function develope(cb) {
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    });

    watch('./src/index.html', function (cb) {
        buildHtml();
        browserSync.reload();
        cb();
    });
    watch('./src/sass/*', buildSass);
    cb();
}

exports.default = series(
    clean,
    parallel(buildHtml, buildSass, buildAssets),
    develope
);

exports.build = series(clean, parallel(buildHtml, buildSass, buildAssets));
