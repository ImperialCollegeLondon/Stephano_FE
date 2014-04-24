// Depends on jQuery
var Stephano = (function(){
    var App = function(){
        this.configURL = './config.json';
        this.setHeader();
        this.loadConfig();

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
        $.getJSON(this.configURL, {}, this.loadConfigCallback.bind(this));
    }

    App.prototype.loadConfigCallback = function(data)
    {
        this.config = data;

        this.loadPlugins();
       // this.selectDataSet();
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
    };

    App.prototype.loadPanel = function(panel, cfg)
    {
        var panel = $('.' + panel);

        if(cfg.length === 1)
        {
            this.loadPlugin(panel, cfg[0]);
        }
        else
        {
            this.createTabs(panel, cfg);
            cfg.forEach(function(ele, idx){
                this.loadPluginInTab(panel, ele, idx);
            });
        }
    };

    App.prototype.loadPlugin = function(panel, cfg)
    {
        panel.append('<div id="' + cfg.id + '" style="height:100%;"></div>');

        var Plugin = Stephano.Plugins[cfg.name],
            instance = new Plugin($('#' + cfg.id), cfg);


    };

    App.prototype.loadPluginInTab = function(panel, cfg, idx)
    {

    };

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

        $('.west, .east, .south').trigger('stephano_resize', {});

    };

    App.prototype.setSizesFromEast = function(event, ui)
    {
        var ttlHeight = $('.main').height(),
            west = $('.west'),
            east = $('.east'),
            south = $('.south');

        west.height(east.height());
        south.height(ttlHeight - east.height() - 4);

        $('.west, .east, .south').trigger('stephano_resize', {});
    };

    return { App: App, Plugins : {} };
})();
