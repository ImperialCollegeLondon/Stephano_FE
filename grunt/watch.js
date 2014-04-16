module.exports = {
//    js: {
//        files : '**/*.js',
//        tasks : ['node_serverOne']
//    },
    css: {
        files: '**/*.less',
        tasks: ['less', 'autoprefixer'],
        options: {
          livereload: true,
        }
    },
    livereload: {
        options: {
            livereload: 3579
        },
        files: [
            'app/index.html',
            '**/*.less'
        ]
    }
}
