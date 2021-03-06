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
