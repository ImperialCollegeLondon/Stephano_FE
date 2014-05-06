// Depends on jQuery
var Stephano = (function(){
    var dataset = "";

    var App = function(){
        this.setHeader();

        if(dataset == "")
        {
            this.openSelectDatasetDialog();
        }

        $('#west').resizable({
            resize: this.setSizesFromWest
        });

        $('#east').resizable({
            handles: 's',
            resize: this.setSizesFromEast
        });

        $(window).on('resize', function(evt, ui){
            if(evt.target == window)
            {
                this.setSizesFromWest.call(this, evt, ui);
            }
        }.bind(this));
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
        return ele;
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

        var ds_ele = this.addElementWithText(header, 'button', 'Dataset : ' + (dataset_name || "Please Select"));
        ds_ele.id = "btn_select_dataset";
        ds_ele.type = "button";
        ds_ele.addEventListener('click', this.openSelectDatasetDialog.bind(this));

        this.dataset_button = ds_ele;
    }

    App.prototype.loadPlugins = function()
    {
        $('.panel, .tab-list').remove();
        $('.tabs').removeClass('tabs');

       for( var panel in this.config )
       {
            this.loadPanel(panel, this.config[panel]);
       }
    };

    App.prototype.loadPanel = function(panel, cfg)
    {
        var panel = $('#' + panel);

        if(cfg.length === 1)
        {
            this.loadPlugin(panel, cfg[0]);
        }
        else
        {
            this.createTabs(panel, cfg);
        }
    };

    App.prototype.createTabs = function(panel, config)
    {
        panel.addClass('tabs');
        panel.append('<div class="tab-list"></div>');

        for( var c = 0; c < config.length; c++ )
        {
            this.loadPlugin(panel, config[c]);
        }

        $('.tab-list .tab:first', panel).click();
    }

    App.prototype.addTab = function(panel,cfg)
    {
        $('.tab-list', panel).append('<button type="button" class="tab" id="tab-' + cfg.id + '" tab-id="' + cfg.id + '">' + cfg.name + '</button>');

        $('#tab-' + cfg.id, panel).on('click', this.openTab_Handler);
    }

    App.prototype.openTab_Handler = function(evt){
        var ele = $(this),
            tab_id = $(this).attr('tab-id');

        $('.active', ele.parent().parent()).removeClass('active');

        ele.addClass('active');
        $('#' + tab_id).addClass('active');

    }

    App.prototype.openSelectDatasetDialog = function()
    {
       $.getJSON('/api/datasets', this.loadDatasetCallback.bind(this));
    }

    App.prototype.loadDatasetCallback = function(data)
    {
        var popup = $('#dataset_selector'),
            popup_content = $('section', popup);

        $('button', popup_content).remove();

        for (var i = 0; i < data.length; i++)
        {
            popup_content.append('<button id="' + data[i] + '" type="button" class="dataset">' + data[i] + '</button>');
            $('button', popup_content).click(this.selectDatasetCallback.bind(this));
        }

        popup.show();
    }

    App.prototype.selectDatasetCallback = function(evt)
    {
        this.selectDataset(evt.target.id);
    }

    App.prototype.selectDataset = function(dataset)
    {
        this.configURL = '/api/' + dataset + '/config';
        this.loadConfig();

        $('#dataset_selector').hide();
    }

    App.prototype.addPluginContainer = function(panel, config)
    {
        panel.append('<div id="' + config.id + '" title="' + config.name + '" style="height:100%;" class="panel"></div>');
    }

    App.prototype.loadPlugin = function(panel, cfg)
    {
        this.addPluginContainer(panel, cfg)

        if( panel.hasClass('tabs') )
        {
            this.addTab(panel, cfg);
        }

        var Plugin = Stephano.Plugins[cfg.type],
            instance = new Plugin($('#' + cfg.id), cfg);

    };

    App.prototype.setSizesFromWest = function(event, ui)
    {

        var ttlWidth = $('.main').width(),
            ttlHeight = $('.main').height(),
            west = $('#west'),
            east = $('#east'),
            south = $('#south');

        east.width(ttlWidth - west.outerWidth() - 6);
        east.height(west.innerHeight());

        var s_diff = south.innerHeight() - south.height();

        south.height(ttlHeight - east.outerHeight() - s_diff - 6);

        $('#west, #east, #south').trigger('stephano_resize', {});
    };

    App.prototype.setSizesFromEast = function(event, ui)
    {


        var ttlHeight = $('.main').height(),
            west = $('#west'),
            east = $('#east'),
            south = $('#south');

        west.height(east.innerHeight());

        var s_diff = south.innerHeight() - south.height();

        south.height(ttlHeight - west.outerHeight() - s_diff - 6);

        $('#west, #east, #south').trigger('stephano_resize', {});
    };

    return { App: App, Plugins : {} };
})();
