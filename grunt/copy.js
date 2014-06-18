module.exports = {
    html: {
        files: [{ expand : true, cwd: 'app/', src: ['index.html'], dest : 'dist', filter: 'isFile'}]
    },
    css: {
        files: [{ expand : true, cwd: 'app/css', src: ['font/.*'], dest : 'dist/css'}]
    },
    images:{
        files: [{expand : true, cwd: 'app/images', src:['*.png', '*.jpg','*.svg'], dest: 'dist/images'}]
    }

}
