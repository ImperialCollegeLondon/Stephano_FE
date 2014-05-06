Stephano.Plugins.PhyloCanvas = (function(){
    var PCanvas = function(div, conf){
        /**
         * Check for jQuery
         */
        if(!$) {
            alert("JQuery not detected");
            return;
        }


        this.div = div;

        /**
         * Check for PhyloCanvas
         */
        if(!window['PhyloCanvas'] || !PhyloCanvas.Tree){
            $(div).text('PhyloCanvas not available');
            return;
        }

        /**
         * Resize event
         */
       div.parent().on('stephano_resize', this.resize_handler.bind(this));

        div.html('<div style="position:absolute;bottom:3em;height:1em;left:0;padding:0.2em;z-index:100;">Node size :   <div id="ns_slider" style="display: inline-block;width:18em;"></div></div><div style="position:absolute;bottom:1.5em;height:1em;left:0;padding:0.2em;z-index:100;">  Label size : <div id="ls_slider" style="display: inline-block;width:18em;"></div> </div><div class="pc-toolbar"><button type="button" class="reset btn">Redraw original tree</button><button type="button" class="labels btn" name="labels" >Show Labels</button>' +
                    '<div class="btn-group">'+
                        '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown">Tree Type <span class="caret"></span></button>' +
                        '<ul class="dropdown-menu">' +
                            '<li><a class="rect" href="javascript:void(0);">Rectangular</a></li>' +
                            '<li><a class="circ" href="javascript:void(0);">Circular</a></li>' +
                            '<li><a class="rad" href="javascript:void(0);">Radial</a></li>' +
                        '</ul>'+
                    '</div></div>');

        $('.dropdown-toggle').on('click', function(evt)
        {
            $('.dropdown-menu', this.parent()).addClass('show');

        });

        this.phylo = new PhyloCanvas.Tree(div[0]);
        var phy = this.phylo;
        phy.navigator = false;

        phy.load(conf.datasource);

        $('#ns_slider').slider({
            min : 0,
            max: 10,
            step : 0.1,
            slide : function(evt, ui)
            {
                phy.setNodeSize(ui.value);
            },
            value : 0.5
        });

        $('#ls_slider').slider({
            min : 6,
            max: 32,
            step : 0.1,
            slide : function(evt, ui)
            {
                phy.setTextSize(ui.value);
            },
            value : 10
        });



        if(conf.treeType)
        {
            this.phylo.treeType = conf.treeType;
            if(conf.treeType == 'radial')
            {
                $('.rad').addClass('selected');
            }
            else if(conf.treeType == 'circular')
            {
                $('.circ').addClass('selected');
            }
            else if(conf.treeType == 'rectangular')
            {
                $('.rect').addClass('selected');
            }
        }
        else
        {
            this.phylo.treeType = "radial";
            $('.rad').addClass('selected');
        }

        this.phylo.showLabels = false;
        this.phylo.baseNodeSize = 0.5;
        this.phylo.selectedNodeSizeIncrease = 0.5;
        this.phylo.selectedColor = "rgba(255,128,50,1)";
        this.phylo.rightClickZoom = true;

        this.phylo.onselected = function(nids)
        {
            if(typeof nids == 'string') nids = nids.split(',');

            $(div).trigger({
                type : 'selected',
                nodeIds : nids,
                source: 'phylocanvas'
            });
        };

        this.phylo.onredrawtree = function(nids)
        {
            if(typeof nids == 'string') nids = nids.split(',');

            $('#content').trigger({
                type : 'subset',
                nodeIds : nids,
                source: 'phylocanvas'
            });
        };

        this.phylo.originalTreeRedrawn = function()
        {
            $('#content').trigger({
                type : 'unsubset',
                source: 'phylocanvas'
            });
        };

        var plo = this;
        $('#content').on('colour', function(evt)
        {
            plo.setColourAndShape(evt.ids, evt.colour, evt.shape);
        });

        $('#content').on('selected', function(evt)
        {
            if(evt.source != 'phylocanvas')
            {
                plo.phylo.selectNodes(evt.nodeIds.join(','));
                console.debug(evt.source);
            }
        });

        $('#content').on('relabel', function(evt)
        {

            var data = evt.stuff;

            for(var k in data)
            {
                for(var i = data[k].length; i--; )
                {
                    if(plo.phylo.branches[data[k][i]]) plo.phylo.branches[data[k][i]].label = k;
                }
            }

            plo.phylo.displayLabels();
        });

        $('.rect', div).click(function(){
            plo.phylo.setTreeType('rectangular');
            $('.button').removeClass('selected');
            $('.rect').addClass('selected');
        });
        $('.circ', div).click(function(){
            plo.phylo.setTreeType('circular');
            $('.button').removeClass('selected');
            $('.circ').addClass('selected');
        });
        $('.rad', div).click(function(){
            plo.phylo.setTreeType('radial');
            $('.button').removeClass('selected');
            $('.rad').addClass('selected');
        });
        $('.reset', div).click(function(){
            plo.phylo.redrawOriginalTree();
        });

        if(phy.showLabels){
            $('.labels.btn').text('Hide Labels');
            //$('.labels.button').addClass('selected');
        }
        else
        {
            $('.labels.btn').text('Show Labels');
            //$('.labels.button').removeClass('selected');
        }

        $('.labels.btn').click(function(e){
            if(phy.showLabels){
                $('.labels.btn').text('Show Labels');
                phy.hideLabels();
                //$('.labels.button').removeClass('selected');
            }
            else
            {
                $('.labels.btn').text('Hide Labels');
                phy.displayLabels();
                //$('.labels.button').addClass('selected');
            }
        });

        this.resize_handler();
    };

    PCanvas.prototype.resize_handler = function(evt)
    {
        var emt = this.div.parent();
        this.phylo.setSize(emt.innerWidth() - 4, emt.innerHeight() - 4);
    }

    PCanvas.prototype.load = function(url)
    {
        this.phylo.load(url, 'tree', 'newick');
    };

    PCanvas.prototype.setColourAndShape = function(ids, colour, shape)
    {
        this.phylo.setNodeColourAndShape(ids, colour, shape, 7);
    };

    return PCanvas;
}());