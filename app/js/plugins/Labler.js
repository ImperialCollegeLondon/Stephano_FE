//Array.join most efficient method of string concatenation;
// -- might be worth testing!
Stephano.Plugins.labeler = function(div, conf){
    this.jqele = $(div);
    this.jqele.addClass('labeler');

    this.conf = conf;

    this.load(conf.datasource);
};

Stephano.Plugins.labeler.prototype.load = function(url)
    {

        if(!url.match(/^https?:/))
        {
            url = location.origin + url;
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
                    $('.' + grp_cls, l_div).append('<button class="btn ' + (data[i].name == this.conf.colourField ? 'selected' : '') + '" id="' + data[i].name + '">' + data[i].label + (data[i].name == this.conf.colourField ? '<div class="icon-map-marker icon-white pull-right"></div>' : '') +'</button>');
                }
                else
                {
                    $('.' + grp_cls, c_div).append('<button class="btn ' + (data[i].name == this.conf.colourField ? 'selected' : '') + '" id="' +  data[i].name + '" >' + data[i].label + (data[i].name == this.conf.colourField ? '<div class="icon-map-marker icon-white pull-right"></div>' : '') +'</button>');
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
        obj = this.fields[field_id];

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
            url = location.origin  + url + obj.name;
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
                        positive : { colour : 'rgba(16, 238,0, 1)', shape : 'circle', map_shape : 'o' },
                        negative : { colour : 'rgba(255, 47, 43, 1)', shape : 'circle', map_shape : 'o'  },
                        other :  { colour : 'rgba(100, 100, 100, 1)', shape : 'circle', map_shape : 'o'  },
                        both :  { colour : 'rgba(255, 255, 0, 1)', shape : 'circle', map_shape : 'o'  }
                    }

                for( var raw_key in data )
                {
                    var key;
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
