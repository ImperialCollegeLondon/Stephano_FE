var Stephano = (function () {
  var dataset = "";

  var App = function () {
    this.setHeader();
    this.modules = {};

    this.subset = [];

    var qry = this.parseQuery();
    dataset = qry.dataset

    if (!dataset) {
      this.openSelectDatasetDialog();
    } else {
      this.selectDataset(dataset);
    }

    $('#west').resizable({
      resize: this.setSizesFromWest,
      maxHeight: this.getMaxPanelHeight(),
      maxWidth: this.getMaxPanelWidth()
    });

    $('#east').resizable({
      handles: 's',
      resize: this.setSizesFromEast,
      maxHeight: this.getMaxPanelHeight(),
      maxWidth: this.getMaxPanelWidth()
    });

    $(window).on('resize', function (evt, ui) {
      if (evt.target == window) {
        this.setSizesFromWest.call(this, evt, ui);
      }
    }.bind(this));

    $(document.body).on('subset', function (evt) {
      this.subset = evt.nodeIds;
    }.bind(this));

    $(document.body).on('unsubset', function (evt) {
      this.subset = [];
    }.bind(this));
  };

  App.prototype.loadConfig = function () {
    $.getJSON(this.configURL, {}, this.loadConfigCallback.bind(this));
  }

  App.prototype.loadConfigCallback = function (data) {
    this.config = data;

    this.loadPlugins();
    // this.selectDataSet();
  }

  App.prototype.addElementWithText = function (parent, tagname, content) {
    var ele = document.createElement(tagname);
    ele.appendChild(document.createTextNode(content));
    parent.appendChild(ele);
    return ele;
  }

  App.prototype.emptyElement = function (ele) {
    while (ele.hasChildNodes()) {
      ele.removeChild(ele.childNodes[0])
    }
  }

  App.prototype.parseQuery = function () {
    var query_string = location.search.substr(1), //get rid of the question mark
      pair_strings = query_string.split('&'),
      pair,
      query = {};

    for (var i = 0; i < pair_strings.length; i++) {
      pair = pair_strings[i].split('=');
      query[pair[0]] = pair[1];
    }

    return query;

  }

  App.prototype.setHeader = function (dataset_name) {
    var header = $('.header')[0];

    this.emptyElement(header);
    this.addElementWithText(header, 'h1', 'Stephano');

    var ds_ele = this.addElementWithText(header, 'button', 'Dataset : '),
      ds_name = this.addElementWithText(ds_ele, 'span', 'Please select');

    ds_ele.id = "btn_select_dataset";
    ds_ele.type = "button";

    ds_name.className = "dataset_name";

    ds_ele.appendChild(ds_name);
    ds_ele.addEventListener('click', this.openSelectDatasetDialog.bind(this));

    this.dataset_button = ds_ele;
  }

  App.prototype.loadPlugins = function () {
    $('.panel, .tab-list').remove();
    $('.tabs').removeClass('tabs');

    for (var panel in this.config) {
      this.loadPanel(panel, this.config[panel]);
    }
  };

  App.prototype.loadPanel = function (panel, cfg) {
    var panel = $('#' + panel);

    if (cfg.length === 1) {
      this.modules[cfg[0].id] = this.loadPlugin(panel, cfg[0], this);
    } else {
      this.createTabs(panel, cfg);
    }
  };

  App.prototype.createTabs = function (panel, config) {
    panel.addClass('tabs');
    panel.append('<div class="tab-list"></div>');

    for (var c = 0; c < config.length; c++) {
      this.modules[config[c].id] = this.loadPlugin(panel, config[c], this);
    }

    $('.tab-list .tab:first', panel).click();
  }

  App.prototype.addTab = function (panel, cfg) {
    $('.tab-list', panel).append('<button type="button" class="tab" id="tab-' + cfg.id + '" tab-id="' + cfg.id + '">' + cfg.name + '</button>');

    $('#tab-' + cfg.id, panel).on('click', this.openTab_Handler);
  }

  App.prototype.getMaxPanelHeight = function () {
    return $('.main').height() - 50;
  }

  App.prototype.getMaxPanelWidth = function () {
    return $('.main').width() - 50;
  }

  App.prototype.openTab_Handler = function (evt) {
    var ele = $(this),
      tab_id = $(this).attr('tab-id');

    $('.active', ele.parent().parent()).removeClass('active');

    ele.addClass('active');
    $('#' + tab_id).addClass('active');

  }

  App.prototype.openSelectDatasetDialog = function () {
    $.getJSON('/api/datasets', this.loadDatasetCallback.bind(this));
  }

  App.prototype.loadDatasetCallback = function (data) {
    var popup = $('#dataset_selector'),
      popup_content = $('div', popup);

    $('button', popup_content).remove();

    for (var i = 0; i < data.length; i++) {
      popup_content.append('<button id="' + data[i] + '" type="button" class="dataset">' + data[i] + '</button>');
      $('button', popup_content).click(this.selectDatasetCallback.bind(this));
    }

    popup.show();
  }

  App.prototype.selectDatasetCallback = function (evt) {
    this.selectDataset(evt.target.id);
  }

  App.prototype.selectDataset = function (dataset) {
    this.configURL = '/api/' + dataset + '/config';
    this.loadConfig();

    $('.dataset_name').text(dataset);

    $('#dataset_selector').hide();
  }

  App.prototype.addPluginContainer = function (panel, config) {
    panel.append('<div id="' + config.id + '" title="' + config.name + '" style="height:100%;" class="panel"></div>');
  }

  App.prototype.loadPlugin = function (panel, cfg) {
    this.addPluginContainer(panel, cfg)

    if (panel.hasClass('tabs')) {
      this.addTab(panel, cfg);
    }

    var Plugin = Stephano.Plugins[cfg.type],
      instance = new Plugin($('#' + cfg.id), cfg, app);

    return instance;

  };

  App.prototype.setSizesFromWest = function (event, ui) {

    var ttlWidth = $('.main').width(),
      ttlHeight = $('.main').height(),
      west = $('#west'),
      east = $('#east'),
      south = $('#south');

    east.width(ttlWidth - west.outerWidth());
    east.height(west.innerHeight() - 20);

    var s_diff = south.innerHeight() - south.height();

    south.height(ttlHeight - east.outerHeight() - s_diff - 6);

    $('#west, #east, #south').trigger('stephano_resize', {});
  };

  App.prototype.setSizesFromEast = function (event, ui) {


    var ttlHeight = $('.main').height(),
      west = $('#west'),
      east = $('#east'),
      south = $('#south');

    west.height(east.innerHeight() - 20);

    var s_diff = south.innerHeight() - south.height();

    south.height(ttlHeight - west.outerHeight() - s_diff - 6);

    $('#west, #east, #south').trigger('stephano_resize', {});
  };

  App.prototype.popupImageGrid = function () {
    $(document.body).append('<canvas id="image_grid" class="popup popped" style="background:white;width:300px;height:300px;" width="300" height="300"></canvas>');
    var canvas = $('#image_grid')[0].getContext('2d');
    canvas.restore();
    this.modules.labels.getImageGrid(canvas);
  }

  return {
    App: App,
    Plugins: {},
    COLOURS: ["rgba(255,0,0,1)", "rgba(0,128,0,1)", "rgba(192,192,192,1)", "rgba(255,255,0,1)", "rgba(255,255,255,1)", "rgba(128,0,128,1)", "rgba(128,128,128,1)", "rgba(128,0,0,1)", "rgba(0,0,204,1)", "rgba(159,255,159,1)", "rgba(255,157,206,1)", "rgba(179,102,255,1)"],
    SHAPES: ["circle", "square", "triangle", "star"],
    MAP_SHAPES: ["o", "s", "t", "x"]
  };
})();

// All this file does is do some compatibility testing and bootstrap the app.
$(function () {
  var app = new Stephano.App();
  window.app = app;
});

//Array.join most efficient method of string concatenation;
// -- might be worth testing!
Stephano.Plugins.labeler = function(div, conf, app){
    this.jqele = $(div);
    this.jqele.addClass('labeler');

    this.conf = conf;

    this.load(conf.datasource);
};

Stephano.Plugins.labeler.prototype.load = function(url)
    {

        if(!url.match(/^https?:/))
        {
            url = '//' + location.host + url;
        }
        var ctx = this;

        $.getJSON(url, this.drawControls.bind(this));


        $(document.body).on('unsubset', $.proxy(function(evt)
        {
            if(this.cur_label) this.relabel(this.cur_label);
        }, this));
    };

    /**
     * @param data {array} the data to be drawn;
     */
Stephano.Plugins.labeler.prototype.drawControls = function(data_)
    {
        this.fields = {};
        var div = this.jqele,c_div,l_div,data;

        div.append('<div class="row-fluid"><div class="group colour"><h4>Colour by: This will colour points on the map and also tree nodes.</h4><div class="General"></div></div><div class="group labels"><h4>Labels:  This will display text next to nodes on tree</h4><div class="General"></div></div></div>');
        c_div = $('.colour', div);
        l_div =  $('.labels', div);

        for( var grp in data_)
        {
            var grp_cls = grp.replace(/[\s\/\\]/gi, '_');

            if(grp != 'General')
            {
                c_div.append('<div class="' + grp_cls + '"><h5>' + grp + '</h5></div>');
                l_div.append('<div class="' + grp_cls + '"><h5>' + grp + '</h5></div>');
            }

            data = data_[grp];

            for( var i = 0; i < data.length; i++ )
            {
                //if(this.fields[data[i].name]) throw "duplicate field";

                this.fields[data[i].name] = data[i];

                if ( data[i].type == "label" )
                {
                    $('.' + grp_cls, l_div).append('<button class="btn ' + (data[i].name == this.conf.colourField ? 'selected' : '') + '" id="' + data[i].name + '" gismoh-label_type="' + data[i].type + '">' + data[i].label + (data[i].name == this.conf.colourField ? '<div class="icon-map-marker icon-white pull-right"></div>' : '') +'</button>');
                }
                else
                {
                    $('.' + grp_cls, c_div).append('<button class="btn ' + (data[i].name == this.conf.colourField ? 'selected' : '') + '" id="' +  data[i].name + '"  gismoh-label_type="' + data[i].type + '">' + data[i].label + (data[i].name == this.conf.colourField ? '<div class="icon-map-marker icon-white pull-right"></div>' : '') +'</button>');
                }
            }

            if(!$('.' + grp_cls + ' button', l_div).length) $('.' + grp_cls , l_div).remove();
            if(!$('.' + grp_cls + ' button', c_div).length) $('.' + grp_cls , c_div).remove();
        }

        $('button', div).click(this.clickHandler.bind(this));

        this.relabel({
            type : 'colour',
            name: 'Country',
            label : 'Country'
        });
    };

Stephano.Plugins.labeler.prototype.clickHandler = function(evt)
{
    var field_id = evt.target.id,
        field_type = evt.target.getAttribute('gismoh-label_type');
        obj = this.fields[field_id],
        obj.type = field_type;
        btn = $(evt.target);

    $('.selected', btn.parents('.group')).removeClass('selected');
    btn.addClass('selected');

    this.relabel(obj);

}

Stephano.Plugins.labeler.prototype.relabel = function(obj)
    {

        var ctx = this,
            url = this.conf.urlbase,
            dataset = this.dataset;

        this.cur_label = obj;

        if(!url.match(/^https?:/))
        {
            url = '//' + location.host  + url + obj.name;
        }

        if(obj.type == 'label')
        {
            $.getJSON(url, function(data){
                if(typeof data != 'object')
                {
                    data = JSON.parse(data);
                }

                var ol = $('#' + ctx.jqele.attr('id') +' .icon-tag');
                var olpar = ol.parent();
                ol.remove();
                if(!$('div', olpar).length)
                {
                    olpar.removeClass('btn-primary');
                }

                $(document.body).trigger({
                    type : 'relabel',
                    stuff : data,
                    field : obj.name
                });

                $('#' + ctx.jqele.attr('id') +'_' + obj.name ).addClass('btn-primary').append('<div class="icon-tag icon-white pull-right"></div>');
            });


        }
        else if(obj.type == 'colour')
        {
            var ol = $('#' + ctx.jqele.attr('id') +' .icon-map-marker');
            var olpar = ol.parent();
            ol.remove();
            if(!$('div', olpar).length)
            {
                olpar.removeClass('btn-primary');
            }

            $.getJSON(url, function(data){
                if(typeof data != 'object')
                {
                    data = JSON.parse(data);
                }

                var c_length = Stephano.COLOURS.length,
                    s_length = Stephano.SHAPES.length,
                    i = 0;


                for(var key in data)
                {
                    if(key == "") continue;

                    var colour = Stephano.COLOURS[i % c_length],
                        shape = Stephano.SHAPES[Math.round(i/c_length) % s_length],
                        map_shape = Stephano.MAP_SHAPES[Math.round(i/c_length) % s_length];


                    ctx.jqele.trigger({
                        type : 'colour',
                        ids : data[key],
                        colour: colour,
                        shape: shape,
                        map_shape : map_shape
                    });

                    i++;
                }
            });
            $('#' + ctx.jqele.attr('id') +'_' + obj.name ).addClass('btn-primary').append('<div class="icon-map-marker icon-white pull-right"></div>');
        }
        else if(obj.type == 'binary')
        {
            var ol = $('#' + ctx.jqele.attr('id') +' .icon-map-marker');
            var olpar = ol.parent();
            ol.remove();
            if(!$('div', olpar).length)
            {
                olpar.removeClass('btn-primary');
            }

            $.getJSON(url, function(data){


                if(typeof data != 'object')
                {
                    data = JSON.parse(data);
                }

                var colour_list = {
                        positive : { colour : 'rgba(255, 47, 43, 1)', shape : 'circle', map_shape : 'o' },
                        negative : { colour : 'rgba(16, 238,0, 1)', shape : 'circle', map_shape : 'o'  },
                        other :  { colour : 'rgba(100, 100, 100, 1)', shape : 'circle', map_shape : 'o'  },
                        both :  { colour : 'rgba(255, 255, 0, 1)', shape : 'circle', map_shape : 'o'  }
                    }

                for( var raw_key in data )
                {
                    var key;

                    if(raw_key == "") continue;
                    if(raw_key == '1')
                    {
                      key = 'positive';
                    }
                    else
                    {
                      key = 'negative';
                    }

                    $(document.body).trigger({
                        type : 'colour',
                        ids : data[raw_key],
                        colour : colour_list[key].colour,
                        shape: colour_list[key].shape,
                        map_shape: colour_list[key].map_shape,
                        field: obj.name,
                        pos_neg: key,
                        colour_list : colour_list
                    });
                }


            });
            $('#' + ctx.jqele.attr('id') +'_' + obj.name ).addClass('btn-primary').append('<div class="icon-map-marker icon-white pull-right"></div>');
        }
        else if(obj.type == 'hg')
        {

        }
    };

    Stephano.Plugins.labeler.prototype.getImageGrid = function(canvas)
    {
        var colours = ['rgba(255, 47, 43, 1)','rgba(16, 238,0, 1)','rgba(100, 100, 100, 1)','rgba(255, 255, 0, 1)'], shapes = Stephano.MAP_SHAPES;

        for( var i = 0; i < shapes.length; i++ )
        {
            for ( var j = 0; j < colours.length; j++ )
            {

                var img = new Image();
                img.top = i * 13;
                img.left = j * 18;
                img.onload = function() {
                    canvas.drawImage(this, this.top, this.left, 15, 22);
                }
                img.src = '/markers/point?shape=' + shapes[i] + '&colour=' + colours[j];

            }
        }
    };

if (!Array.isArray) {
  Array.isArray = function(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  };
}

Stephano.Plugins.PhyloCanvas = (function () {
  var PCanvas = function (div, conf, app) {
    /**
     * Check for jQuery
     */
    if (!$) {
      alert("JQuery not detected");
      return;
    }


    this.div = div;

    /**
     * Check for PhyloCanvas
     */
    if (!window['PhyloCanvas'] || !PhyloCanvas.Tree) {
      $(div).text('PhyloCanvas not available');
      return;
    }

    /**
     * Resize event
     */

    var ctx = this;


    div.html('<div style="position:absolute;bottom:3em;height:1em;left:0;padding:0.2em;z-index:100;">Node size :   <div id="ns_slider" style="display: inline-block;width:18em;"></div></div><div style="position:absolute;bottom:1.5em;height:1em;left:0;padding:0.2em;z-index:100;">  Label size : <div id="ls_slider" style="display: inline-block;width:18em;"></div> </div><div class="pc-toolbar"><button type="button" class="reset btn">Redraw original tree</button><button type="button" class="labels btn" name="labels" >Show Labels</button>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">Tree Type </button>' +
      '<ul class="dropdown-menu">' +
      '<li><a class="rect" href="javascript:void(0);">Rectangular</a></li>' +
      '<li><a class="circ" href="javascript:void(0);">Circular</a></li>' +
      '<li><a class="rad" href="javascript:void(0);">Radial</a></li>' +
      '</ul>' +
      '</div></div>');


    this.phylo = new PhyloCanvas.Tree(div[0], {
      history_collapsed: true
    });
    var phy = this.phylo;
    phy.navigator = false;
    phy.history_collapsed = true;
    phy.backcolour = true;

    phy.load(conf.datasource);

    div.parent().on('stephano_resize', this.resize_handler.bind(this));

    $('#ns_slider').slider({
      min: 0,
      max: 20,
      step: 0.1,
      slide: function (evt, ui) {
        phy.setNodeSize(ui.value);
      },
      value: 1
    });

    $('#ls_slider').slider({
      min: 6,
      max: 32,
      step: 0.1,
      slide: function (evt, ui) {
        phy.setTextSize(ui.value);
      },
      value: 10
    });

    if (conf.treeType) {
      this.phylo.treeType = conf.treeType;
      if (conf.treeType == 'radial') {
        $('.rad').addClass('selected');
      } else if (conf.treeType == 'circular') {
        $('.circ').addClass('selected');
      } else if (conf.treeType == 'rectangular') {
        $('.rect').addClass('selected');
      }
    } else {
      this.phylo.treeType = "radial";
      $('.rad').addClass('selected');
    }

    this.phylo.showLabels = false;
    this.phylo.baseNodeSize = 1;
    this.phylo.selectedNodeSizeIncrease = 0;
    this.phylo.selectedColor = "rgba(255,128,50,1)";
    this.phylo.rightClickZoom = true;

    this.phylo.addListener('selected', function (evt) {
      var nids = evt.nodeIds;

      evt.preventDefault();
      evt.bubbles = false;
      if (typeof nids == 'string') nids = nids.split(',');

      $(document.body).trigger({
        type: 'selected',
        nodeIds: nids,
        source: 'phylocanvas'
      });

      return false;
    });

    this.phylo.addListener('subtree', function (evt) {

      var nids = this.phylo.root.getChildIds();

      if (typeof nids == 'string') nids = nids.split(',');

      $(document.body).trigger({
        type: 'subset',
        nodeIds: nids,
        source: 'phylocanvas'
      });
    }.bind(this));

    this.phylo.addListener('redraw_original', function () {
      $(document.body).trigger({
        type: 'unsubset',
        source: 'phylocanvas'
      });
    });

    var plo = this;
    $(document.body).on('colour', function (evt) {
      plo.setColourAndShape(evt.ids, evt.colour, evt.shape);
    });

    $(document.body).on('selected', function (evt) {
      if (evt.target == document.body && evt.source != 'phylocanvas') {
        plo.phylo.selectNodes(evt.nodeIds);
      }
    });

    $(document.body).on('relabel', function (evt) {

      var data = evt.stuff;

      // for (var k in data) {
      //   if (k == 'vals') {
      //     continue;
      //   }
      //   for (var i = data[k].length; i--;) {
      //     if (plo.phylo.branches[data[k][i]]) {
      //       plo.phylo.branches[data[k][i]].label = k;
      //     }
      //   }
      // }

      Object.keys(data).forEach(function (keys) {
        if (keys === 'vals') {
          return;
        }

        if (!Array.isArray(keys)) {
          return;
        }

        keys.forEach(function (key) {
          var branch = plo.phylo.branches[key];

          if (branch) {
            branch.label = key;
          }
        });
      });

      plo.phylo.displayLabels();
      plo.phylo.draw();
    });

    $('.rect', div).click(function (evt) {
      plo.phylo.setTreeType('rectangular');
      $('.button').removeClass('selected');
      $('.rect').addClass('selected');

      $(evt.target).parents('ul').removeClass('expanded');
    }.bind(this));
    $('.circ', div).click(function (evt) {
      plo.phylo.setTreeType('circular');
      $('.button').removeClass('selected');
      $('.circ').addClass('selected');

      $(evt.target).parents('ul').removeClass('expanded');
    });
    $('.rad', div).click(function (evt) {
      plo.phylo.setTreeType('radial');
      $('.button').removeClass('selected');
      $('.rad').addClass('selected');

      $(evt.target).parents('ul').removeClass('expanded');
    });
    $('.reset', div).click(function () {
      plo.phylo.redrawOriginalTree();
    });

    if (phy.showLabels) {
      $('.labels.btn').text('Hide Labels');
      //$('.labels.button').addClass('selected');
    } else {
      $('.labels.btn').text('Show Labels');
      //$('.labels.button').removeClass('selected');
    }

    $('.labels.btn').click(function (e) {
      if (phy.showLabels) {
        $('.labels.btn').text('Show Labels');
        phy.hideLabels();
        //$('.labels.button').removeClass('selected');
      } else {
        $('.labels.btn').text('Hide Labels');
        phy.displayLabels();
        //$('.labels.button').addClass('selected');
      }
    });

    $('.btn-group [data-toggle=dropdown]').click(this.dropdownToggle.bind(this));

    this.resize_handler();
  };

  PCanvas.prototype.resize_handler = function (evt) {

    var emt = this.div.parent();
    this.phylo.setSize(emt.innerWidth() - 4, emt.innerHeight() - 4);
  }

  PCanvas.prototype.load = function (url) {
    this.phylo.load(url, 'tree', 'newick');
  };

  PCanvas.prototype.setColourAndShape = function (ids, colour, shape) {
    this.phylo.setNodeColourAndShape(ids, colour, shape, 7);
  };

  PCanvas.prototype.dropdownToggle = function (evt) {
    var container = $(evt.target).parent(),
      list = $('ul.dropdown-menu', container);

    list.toggleClass('expanded');

    evt.preventDefault();
    evt.stopPropagation();

    $(document.body).one('click', function () {
      list.removeClass('expanded');
    });
  }

  return PCanvas;
}());

//Array.join most efficient method of string concatenation;
// -- might be worth testing!
Stephano.Plugins.Tabular = function(div, cfg, app){
    this.columns = [];
    this.jqele = $(div);
    this.app = app;
    this.jqele.addClass('tabular');

    $(div).html('waiting for data');

    this.load(cfg.datasource);

    $(document.body).on('selected', function(evt)
    {
        if(evt.target != document.body) { return false; }

        var nids = evt.nodeIds;
        $('tbody tr', this.jqele).hide();

        if( nids.length )
        {

            $('#' + nids.join(', #'), this.jqele).show();
        }
        else if( this.app.subset.length )
        {

            $('#' + this.app.subset.join(', #'), this.jqele).show();
        }
        else
        {
            $('tbody tr', this.jqele).show();
        }
    }.bind(this));
};

Stephano.Plugins.Tabular.prototype = {
    load: function(url, nids)
    {
        if(url)
        {
            this.baseURL = url;
        }

        var args = {};
        if(nids)
        {
            args['nids'] = nids.join(',') ;
        }

        $.ajax({
            url : url,
            data: args,
            success : function(sdata, status, xhr)
            {
                this.jqele.empty();

                var data = sdata;

                if( data['message'] )
                {
                    this.jqele.append('<p>' + data['message'] + '</p>');
                }
                else
                {

                    this.drawTable(this.jqele, data);

                }

            },
            context : this
        });


    },
    /**
     * @param data {array} the data to be drawn;
     */
    drawHeaders : function(jqele,data)
    {
        var hrow = '<tr><th>';
        for(var k in data)
        {
            this.columns.push(k);
            hrow = hrow + k + '</th><th>';
        }
        hrow = hrow.substring(0, hrow.length - 4) + '</tr>';
        $('thead', jqele).append(hrow);
    },
    drawrow: function(jqele, data)
    {
        var str = '<tr id="' + data['Isolate'] + '"><td>';
        for(var fld in data)
        {
            if(data[fld] && data[fld] != 'None')
                str = str + data[fld] + '</td><td>';
            else
                str = str + '&nbsp;</td><td>';
        }
        str = str.substring(0, str.length - 4) + '</tr>';
        $('tbody', jqele).append(str);
    },
    drawTable : function(jqele, data)
    {
        var len = data.length;

        this.jqele.css('overflow', 'auto');
        this.jqele.append('<table class="table table-bordered table-hover"><thead></thead><tbody></tbody></table>');

        var jq = $('table', this.jqele);

        this.drawHeaders(jq, data[0]);

        for( var i = 0; i < len; i++ )
        {
            this.drawrow(jq, data[i]);
        }

        var ctx = this;

    }
};

Stephano.Plugins.googlemaps = function(div, conf){

    this.imagebase = 'plus.epicollect.net';

    this.superFilter = true;

    /**
     * Check for jQuery
     */
    if(!$) {
        alert("JQuery not detected");
        return;
    }

    /**
     * Check for google maps
     */
    if(!window['google'] || !google.maps){
        $(div).text('Google maps API not available');
        return;
    }

    this.map = new google.maps.Map(div[0], {
        center : new google.maps.LatLng(0,0),
        zoom : 1,
        mapTypeId : google.maps.MapTypeId.ROADMAP,
        overviewMapControl: false,
        overviewMapControlOptions: {
            opened : true
        }
    });

    div.css('position', 'relative');
    div.css('width', '100%');
    //console.debug(div.offsetParent().hasClass('ui-tabs'));
    if($('ul', div.offsetParent()).length > 0 )
    {
        div.css('height', '91%');
    }

    this.load(conf.datasource);

    this.markers = [];
    this.markerIds = {};
    this.bubble_ids = {};
    this.clusterer;

    this.iBubble = new google.maps.InfoWindow();

    google.maps.event.addListener(this.iBubble,'closeclick',function(){
        this.clearFilter();
    }.bind(this));

    if(conf.cluster)
    {
        this.clusterer = new MarkerClusterer(this.map, this.markers,
        {
            maxZoom : 14,
            gridSize : 30,
            styles : [
                {
                    url : 'http://' + this.imagebase + '/markers/cluster',
                    height: 50,
                    width: 50,
                    anchor: [24, 24],
                    textColor: 'transparent',
                    textSize: 14
                },
                {
                    url : 'http://' + this.imagebase + '/markers/cluster',
                    height: 50,
                    width: 50,
                    anchor: [24, 24],
                    textColor: 'transparent',
                    textSize: 14
                },
                {
                    url : 'http://' + this.imagebase + '/markers/cluster',
                    height: 50,
                    width: 50,
                    anchor: [24, 24],
                    textColor: 'transparent',
                    textSize: 14
                },
                {
                    url : 'http://' + this.imagebase + '/markers/cluster',
                    height: 50,
                    width: 50,
                    anchor: [24, 24],
                    textColor: 'transparent',
                    textSize: 14
                }
            ]
        });
    }

    var gmp = this;
    $(document.body).on('selected', function(evt)
    {
        var nids = evt.nodeIds;

        if(! evt.source || evt.source == 'googlemaps') return;

        if(!nids || nids == '')
        {
            gmp.clearFilter();
            return;
        }

        var n = nids.length;

        gmp.filter(function(mkr)
        {


            if( nids.length == 1 && nids[0] == "" ) return true;

            for( var i = n; i--; )
            {
                if( mkr.ids.indexOf(nids[i]) !== -1 ) return true;
            }
            return false;
        });
    });

    $(document.body).on('colour', function(evt)
    {
        gmp.setColourAndShape(evt.ids, evt.colour, evt.map_shape, evt.field, evt.pos_neg, evt.colour_list);
    });

    $(document.body).on('resize', function()
    {
        google.maps.event.trigger(map, "resize");
    });

    $(document.body).on('subset', function(evt)
    {
        if( typeof evt.nodeIds == 'object' )
        {
            gmp.superFilter = evt.nodeIds;
        }
        else
        {
            gmp.superFilter = true;
        }
        gmp.clearFilter();
    });

    $(document.body).on('unsubset', function(evt)
    {
        gmp.superFilter = true;
        gmp.clearFilter();
    });

};

Stephano.Plugins.googlemaps.prototype = {
    updateClusterer : function()
    {
        if(!this.clusterer) return;

        this.clusterer.removeMarkers(this.clusterer.markers_);
        this.clusterer.addMarkers(this.markers);
    },
    dosuperfilter: function(mkr){
        if(typeof this.superFilter == 'function')
        {
            return this.superFilter(mkr);
        }
        else if(typeof this.superFilter == 'object')
        {

            for(var i = this.superFilter.length; i--;)
            {
                if(mkr.ids.indexOf(this.superFilter[i]) >= 0) return true;

            }
            return false;
        }
        else
        {
            return true;
        }
    },
    filter : function(filter, field)
    {
        if(typeof filter == 'function')
        {
            var len = this.markers.length;
            for(var i = len; i--;)
            {
                this.markers[i].setVisible(filter(this.markers[i]) && this.dosuperfilter(this.markers[i]));
            }
        }
        else if(field)
        {
            var len = this.markers.length;
            for(var i = len; i--;)
            {
                this.markers[i].setVisible(this.markers[i][field] == filter && this.dosuperfilter(this.markers[i]));
            }
        }
    },
    clearFilter : function()
    {
        var len = this.markers.length;
        for(var i = len; i--;)
        {
            this.markers[i].setVisible(this.dosuperfilter(this.markers[i]));
        }
    },
    load : function(url)
    {
        //console.debug('googlemaps loading ' + url);
        $.ajax('//' + location.host + url,{
            success : function(data, x, y)
            {
                if(typeof data == 'string') data = JSON.parse(data);

                this.markers = [];
                var feats = data.features,
                    bounds = new google.maps.LatLngBounds();


                for(var i = 0; i < feats.length; i++)
                {
                    if(!feats[i].geometry.coordinates) continue;

                    var pos = feats[i].geometry.coordinates,
                        iconSize = new google.maps.Size(13, 18),
                        iconOrigin = new google.maps.Point(0,0),
                        icon ={
                            url:'/images/mapmarkers.png',
                            size : iconSize,
                            origin : iconOrigin
                        };

                    if(!this.bubble_ids[pos[1] + ',' + pos[0]])
                    {
                        this.markerIds[feats[i].properties.Isolate] = this.markers.length;

                        var ll = new google.maps.LatLng(pos[1], pos[0]),
                            mkr = new google.maps.Marker({
                                position : ll,
                                map : this.map,
                                id : feats[i].properties.Isolate,
                                ids : [feats[i].properties.Isolate],
                                country : feats[i].country,
                                icon : icon
                            });



                        if(!bounds.contains(ll)) bounds.extend(ll);

                        this.markers.push(mkr);

                        this.bubble_ids[pos[1] + ',' + pos[0]] = [feats[i].properties.Isolate];

                        var ctx = this;

                        this.attachBubble(ctx, mkr);

                    }
                    else
                    {
                        this.bubble_ids[pos[1] + ',' + pos[0]].push(feats[i].id);
                        this.markerIds[feats[i].properties.Isolate] = this.markerIds[this.bubble_ids[pos[1] + ',' + pos[0]][0]];
                        this.markers[this.markerIds[feats[i].properties.Isolate]].ids.push(feats[i].properties.Isolate);
                    }
                }

                this.map.fitBounds(bounds);
                this.updateClusterer();

            },
            context: this
        });
    },
    attachBubble : function(ctx, mkr)
    {
        google.maps.event.addListener(mkr, 'click', function(){
            var ll = mkr.getPosition().lng() + ',' + mkr.getPosition().lat(),
                bubblestring = "Isolates from this location (Click to highlight on tree): <ul>",
                xl = mkr.ids.length;

            for(var x = 0; x < xl; x++)
            {
                bubblestring = bubblestring + '<li class="sample"><a href="javascript:$(document.body).trigger({type:\'selected\',nodeIds:[\'' + mkr.ids[x] + '\'], source : \'googlemaps\'});">' + mkr.ids[x] + '</a></li>';
            }
            bubblestring = bubblestring + '</ul>';

            ctx.filterById(mkr.ids);

            ctx.iBubble.setContent(bubblestring);
            ctx.iBubble.setPosition(mkr.getPosition());
            ctx.iBubble.open(ctx.map);
        });
    },
    setColourAndShape : function(ids, colour, shape, field, pos_neg, colour_list)
    {

        if (!ids) return;
        for(var i = 0; i < ids.length; i++)
        {
            if(this.superFilter !== true && this.superFilter.indexOf(ids[i]) === -1) continue;

            if(this.markers[this.markerIds[ids[i]]])
            {
                var mkr =  this.markers[this.markerIds[ids[i]]], icon = mkr.getIcon();
                icon.origin = new google.maps.Point(0, 0);
                // code for binary colouring
                if(field && pos_neg && colour_list)
                {
                    var c_field = this.markers[this.markerIds[ids[i]]][field];

                    icon.url = "/images/mapmarker_pos_neg.png";

                    if(!c_field || c_field == pos_neg)
                    {
                        this.markers[this.markerIds[ids[i]]][field] = pos_neg;
                        if(pos_neg == 'positive')
                        {
                            icon.origin = new google.maps.Point(0, 0 * 18);
                        }
                        else if(pos_neg == 'negative')
                        {
                            icon.origin = new google.maps.Point(0, 1 * 18);
                        }
                        else
                        {
                            icon.origin = new google.maps.Point(0, 2 * 18);
                        }

                    }
                    else if(c_field != 'other' && c_field != 'other' && c_field != pos_neg)
                    {
                        this.markers[this.markerIds[ids[i]]][field] = 'both';
                        icon.origin = new google.maps.Point(0, 3 * 18);
                    }
                }
                // end of binary colouring code
                else
                {
                    if(colour) this.markers[this.markerIds[ids[i]]].colour = colour;
                    if(shape) this.markers[this.markerIds[ids[i]]]._shape = shape;
                    icon.origin = new google.maps.Point(Stephano.MAP_SHAPES.indexOf(mkr._shape) * 13, Stephano.COLOURS.indexOf(mkr.colour) * 18);
                    icon.url = "/images/mapmarkers.png"
                }


                mkr.setIcon(icon);
            //    this.markers[this.markerIds[ids[i]]].setIcon(new google.maps.MarkerImage('http://' + this.imagebase + '/markers/point?colour=' + this.markers[this.markerIds[ids[i]]].colour +
            //            '&shape=' + this.markers[this.markerIds[ids[i]]]._shape,
            //            new google.maps.Size(22, 32), new google.maps.Point(0,0), new google.maps.Point(7.5, 22), new google.maps.Size(15, 22)));
            }
        }
        if(this.clusterer) this.clusterer.repaint();
    }
};

Stephano.Plugins.googlemaps.prototype.filterById = function(mkrIds)
{
    $(document.body).trigger({
        type : 'selected',
        nodeIds : mkrIds,
        source : 'googlemaps'
    });
};

Stephano.Plugins.googlemaps.prototype.clearFilter = function()
{
    $(document.body).trigger({
        type : 'selected',
        nodeIds : [],
        source : 'googlemaps'
    });
};
