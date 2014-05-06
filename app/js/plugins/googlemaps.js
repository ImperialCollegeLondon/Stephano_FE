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
        overviewMapControl: true,
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

    if(conf.cluster)
    {
        console.debug('clustering...');
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
    $('#content').on('selected', function(evt)
    {
        var nids = evt.nodeIds;
        if(!nids || nids == '')
        {
            gmp.clearFilter();
            return;
        }
        gmp.filter(function(mkr)
        {
            if( nids.length == 1 && nids[0] == "" ) return true;

            var n = nids.length;
            var ni = mkr.ids.length;
            for( var i = n; i--; )
            {
                for( var j = ni; j--; )
                {
                    if( mkr.ids[j] == nids[i] ) return true;
                }
            }
            return false;
        });
    });

    $('#content').on('colour', function(evt)
    {
        gmp.setColourAndShape(evt.ids, evt.colour, evt.shape, evt.field, evt.pos_neg, evt.colour_list);
    });

    $('#content').on('resize', function()
    {
        google.maps.event.trigger(map, "resize");
    });

    $('#content').on('subset', function(evt)
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

    $('#content').on('unsubset', function(evt)
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
        $.ajax(location.origin + url,{
            success : function(data, x, y)
            {
                this.markers = [];
                var feats = data.features;
                var bounds = new google.maps.LatLngBounds();
                for(var i = 0; i < feats.length; i++)
                {
                    var pos = feats[i].geometry.coordinates;
                    if(!this.bubble_ids[pos[1] + ',' + pos[0]])
                    {
                        this.markerIds[feats[i].id] = this.markers.length;
                        var ll = new google.maps.LatLng(pos[1], pos[0]);
                        var mkr = new google.maps.Marker({
                            position : ll,
                            map : this.map,
                            id : feats[i].properties.Isolate,
                            ids : [feats[i].properties.Isolate],
                            country : feats[i].country
                        });
                        if(!bounds.contains(ll)) bounds.extend(ll);
                        this.markers.push(mkr);

                        this.bubble_ids[pos[1] + ',' + pos[0]] = [feats[i].id];

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
            var ll = mkr.getPosition().lng() + ',' + mkr.getPosition().lat();
            console.debug(ll);
            var bubblestring = "Isolates from this location (Click to highlight on tree): <ul>";
            var xl = mkr.ids.length;
            for(var x = 0; x < xl; x++)
            {
                bubblestring = bubblestring + '<li class="sample"><a href="javascript:$(\'#content\').trigger({type:\'selected\',nodeIds:[\'' + mkr.ids[x] + '\'], source : \'googlemaps\'});">' + mkr.ids[x] + '</a></li>';
            }
            bubblestring = bubblestring + '</ul>';

            ctx.iBubble.setContent(bubblestring);
            ctx.iBubble.setPosition(mkr.getPosition());
            ctx.iBubble.open(ctx.map);
        });
    },
    setColourAndShape : function(ids, colour, shape, field, pos_neg, colour_list)
    {
        if (!ids) ids = [];
        for(var i = 0; i < ids.length; i++)
        {
            if(this.superFilter !== true && this.superFilter.indexOf(ids[i]) === -1) continue;
            if(this.markers[this.markerIds[ids[i]]])
            {

                // code for binary colouring
                if(field && pos_neg && colour_list)
                {
                    var c_field = this.markers[this.markerIds[ids[i]]][field];

                    if(!c_field)
                    {
                        this.markers[this.markerIds[ids[i]]][field] = pos_neg;
                        if(colour)this.markers[this.markerIds[ids[i]]].colour = colour;
                        if(shape)this.markers[this.markerIds[ids[i]]]._shape = shape;
                    }
                    else if(c_field != 'other' && c_field != 'other' && c_field != pos_neg)
                    {
                        this.markers[this.markerIds[ids[i]]][field] = 'both';
                        if(colour_list['both'])
                        {
                            if(colour_list.both.colour)this.markers[this.markerIds[ids[i]]].colour = colour_list.both.colour;
                            if(colour_list.both.shape)this.markers[this.markerIds[ids[i]]]._shape = colour_list.both.shape;
                        }
                    }
                }
                // end of binary colouring code
                else
                {
                    if(colour)this.markers[this.markerIds[ids[i]]].colour = colour;
                    if(shape)this.markers[this.markerIds[ids[i]]]._shape = shape;
                }
                this.markers[this.markerIds[ids[i]]].setIcon(new google.maps.MarkerImage('http://' + this.imagebase + '/markers/point?colour=' + this.markers[this.markerIds[ids[i]]].colour +
                        '&shape=' + this.markers[this.markerIds[ids[i]]]._shape,
                        new google.maps.Size(22, 32), new google.maps.Point(0,0), new google.maps.Point(7.5, 22), new google.maps.Size(15, 22)));
            }
        }
        if(this.clusterer) this.clusterer.repaint();
    }
};
