//Array.join most efficient method of string concatenation;
// -- might be worth testing!
Stephano.Plugins.Tabular = function(div, cfg){
    this.columns = [];
    this.jqele = $(div);

    this.jqele.addClass('tabular');

    $(div).html('waiting for data');

    var ctx = this;

    this.load(cfg.datasource);

    $(document.body).on('selected', function(evt)
    {
        var nids = evt.nodeIds;

        if( evt.target == document.body )
        {
            $('tbody tr', this.jqele).hide();
            $('#' + nids.join(', #'), this.jqele).show();
        }
    });
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
