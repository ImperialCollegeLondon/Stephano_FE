module.exports = {
    html: {
        files: [{ expand : true, cwd: 'app/templates', src: ['*.html'], dest : 'dist/templates', filter: 'isFile'}]
    }, 
    css: {
        files: [{ expand : true, cwd: 'app/css', src: ['font/.*'], dest : 'dist/css'}]
    },
    server:{
        files: [{expand : true, cwd: 'app/', src:['app.js', 'server/*.js'], dest: 'dist'}]   
    },
    images:{
        files: [{expand : true, cwd: 'app/images', src:['*.png', '*.jpg'], dest: 'dist/images'}]   
    },
    package:{
        files: [{expand : true,  src:['package.json'], dest: 'dist'}]   
    }
    
}