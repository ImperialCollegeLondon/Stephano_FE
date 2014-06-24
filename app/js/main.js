// All this file does is do some compatibility testing and bootstrap the app.
$(function(){
    //Checking for old browers
    /*if(!('querySelector' in document && 'localStorage' in window && 'addEventListener' in window)) {
        document.write("<h1>Stephano</h1><p>I'm afraid this browser does not support the technologies we need to run Stephano</p>");
        return;
    }*/

    var app = new Stephano.App();

    window.app = app;
});
