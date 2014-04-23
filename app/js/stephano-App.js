// Depends on jQuery
var Stephano = (function(){
    var App = function(){
        this.configURl = './config.json';
        this.setHeader();

        $('.west').resizable({
            resize: this.setSizesFromWest
        });

        $('.east').resizable({
            handles: 's',
            resize: this.setSizesFromEast
        });

    };

    App.prototype.loadConfig = function()
    {
        var data = $.getJSON(this.configURL, this.loadConfigCallback.bind(this));
    }

    App.prototype.loadConfigCallback = function(data)
    {
        this.config = data;

        this.loadPlugins();
        this.selectDataSet();
    }

    App.prototype.addElementWithText = function(parent, tagname, content)
    {
        var ele = document.createElement(tagname);
        ele.appendChild(document.createTextNode(content));
        parent.appendChild(ele);
    }

    App.prototype.emptyElement = function(ele)
    {
        while( ele.hasChildNodes() ) { ele.removeChild(ele.childNodes[0]) }
    }

    App.prototype.setHeader = function(dataset_name)
    {
        var header = $('header')[0];
        this.emptyElement(header);
        this.addElementWithText(header, 'h1', 'Stephano');
    }

    App.prototype.loadPlugins = function()
    {
       for( var panel in this.config.panels )
       {
            this.loadPanel(panel, this.config.panels[panel]);
       }
    }

    App.prototype.setSizesFromWest = function(event, ui)
    {

        var ttlWidth = $('.main').width(),
            ttlHeight = $('.main').height(),
            west = $('.west'),
            east = $('.east'),
            south = $('.south');

        east.width(ttlWidth - west.width() - 4);
        east.height(west.height());

        south.height(ttlHeight - west.height() - 4);

    };

    App.prototype.setSizesFromEast = function(event, ui)
    {
        var ttlHeight = $('.main').height(),
            west = $('.west'),
            east = $('.east'),
            south = $('.south');

        west.height(east.height());
        south.height(ttlHeight - east.height() - 4);
    };

    return { App: App, Plugins : {} };
})();
