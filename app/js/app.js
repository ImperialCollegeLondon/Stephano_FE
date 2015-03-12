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
