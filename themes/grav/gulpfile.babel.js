import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import cleanCSS from 'gulp-clean-css';

const paths = {
    styles: {
        src: 'scss/**/*.scss',
        dest: 'css-compiled'
    }
};

export function styles() {
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: 'compressed' }))
        .on('error', sass.logError)
        .pipe(cleanCSS())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(paths.styles.dest));
}

export function css() {
    return styles();
}

function watchFiles() {
    gulp.watch(paths.styles.src, styles);
}

export { watchFiles as watch };

const build = gulp.series(styles);

export default build;
