/*
* The maplayer object wraps several layer types (Mapbox and WMS at the moment) and provides 
* common functions for showing, hiding and handling click events, among other things. 
*
* Handles menu highlighting where applicable as layers are enabled and disabled
* 
*/

GC.MapLayer = function(gc,module,config){
    this.GC = gc;

    // Copy all non-empty variables
    this._config = {};
    for(var x in config){
        if(!this.GC.util.isEmpty(config[x])){
            this._config[x] = config[x];
        }
    }

    this._leafletLayer = false;
    this.module = module;
};

GC.MapLayer.prototype = {

    /*
    * Make the leaflet layer. 
    *
    * Returns a promise which will return the leaflet layer object on success. 
    *
    * Will also set this._leafletLayer
    */
    _makeLeafletLayer:function(){
        // already made?
        if(this._leafletLayer !== false){
            return this._leafletLayer;
        }

        switch(this._config.layer_type){
            case 'Mapbox':
                this._config.zIndex = (this.isBasemap() ? this._config.display_order : this._config.display_order * 100);
                this._leafletLayer = L.mapbox.tileLayer(this._config.layer_name,this._config);
                break;
            case 'WMS':
                var conf = {};
                if(!Boolean(this._config.format)){
                    this._config.format = 'png';
                }
                conf.format = 'image/' + (this._config.format === 'jpg' ? 'jpeg' : this._config.format);
                conf.zIndex = (this.isBasemap() ? this._config.display_order : this._config.display_order * 100);
                conf.layers = this._config.layer_name;
                conf.transparent = (this._config.transparent !== false);
                conf.opacity = this._config.opacity;
                if(!this.GC.util.isEmpty(this._config.cql_filter)){
                    conf.cql_filter = this._config.cql_filter;
                }
                if(!this.GC.util.isEmpty(this._config.styles)){
                    conf.styles = this._config.styles;
                }
                this._leafletLayer = L.tileLayer.wms(this._config.layer_url,conf);
                break;
            default:
                console.log(this._config.type + " layers are not yet supported");
                return false;
        }

        this._leafletLayer.options.maplayer = this;
        return this._leafletLayer;
    },

    show:function(args){
        var self;
        if(args !== undefined){
            self = args.data;

            // On-click caught a click on the checkbox. 
            // Possible switch to hide
            if(args.target.tagName == 'INPUT'){
                if($(args.target).prop('checked') === false){
                    $('li[data-layerid='+self._config.layer_id+']').find('input').prop('checked',false);
                    $('li.maplayerlist').removeClass('activelayer');
                    self.module.activelayer = null;
                    if(args !== undefined){
                        args.stopPropagation();
                        return self.hide();
                    }
                }
            }
        }else{
            self = this;
        }

        var l = self._makeLeafletLayer();
        if(l !== false){

            if(self.isBasemap()){
                // Remove other basemaps
                self.GC.map.removeBasemaps();
                $('li[data-layerid='+self._config.layer_id+']').find('input').prop('checked',true);
            }else{
                $('li.maplayerlist').removeClass('activelayer');
                if(self._config.displayinlayerswitcher){
                    $('li[data-layerid='+self._config.layer_id+']').addClass('activelayer');
                    $('li[data-layerid='+self._config.layer_id+']').find('input').prop('checked',true);
                    self.module.activelayer = self;
                }else{
                    self.module.activelayer = null;
                }
            }

            l.addTo(self.GC.map.map);
            if(args !== undefined){
                args.stopPropagation();
            }
            return true;
        }
        if(args !== undefined){
            args.stopPropagation();
        }
        return false;
    },

    hide:function(){
        if(this._leafletLayer !== false){
            this.GC.map.removeLayers([this._leafletLayer]);
        }
        return true;
    },

    isBasemap:function(){
        return this._config.isbaselayer || false;
    },

    handleClick: function(e){
        // TODO: At some point handleClick will hand off click events to different functions (such as drawing or deleting) depending on other context information
        return this.getFeatureInfo(e);
    },

    getFeatureInfo:function(e){
        var self = this;

        var params = {
            service : "WMS",
            version : "1.1.1",
            request : "GetFeatureInfo",
            layers : this._config.layer_name,
            query_layers : this._config.layer_name,
            bbox : this.GC.map.map.getBounds().toBBoxString(),
            feature_count : 10,
            height : this.GC.map.map.getSize().y,
            width : this.GC.map.map.getSize().x,
            format : "image/png",
            info_format : "text/html",
            srs : "EPSG:4326",
            x : Math.round(this.GC.map.map.layerPointToContainerPoint(e.layerPoint).x),
            y : Math.round(this.GC.map.map.layerPointToContainerPoint(e.layerPoint).y),
            buffer : "8"
        };

        if(!this.GC.util.isEmpty(this._config.cql_filter)){
            params.cql_filter = this._config.cql_filter;
        }

        // Post is better because it can handle 
        var url = this._config.layer_url  + "?" + $.param(params);
        var promise = $.get(
            this._config.layer_url,
            params,
            "html"
        );

        promise.then(
            function(res){
                var blacklistedAttributes =['objectid','oid','gid','oid_','fid','old_id','__gid','shape_len','id'];
                var row;
                var table;

                // Do our best to pretty up the json
                var breaker = '<tr class="popupbreaker"><td colspan="2"></th></tr>';
                try {
                    var fixedup = res.replace(/}{/g,'},{');
                    jsonResponse = JSON.parse(fixedup);
                    table = $("<table class='table table-striped table-bordered table-condensed'>");
                    var rowsLeft = jsonResponse.length;
                    $.each(jsonResponse,function(item,values){
                        $.each(values,function(key,value){
                            if(blacklistedAttributes.indexOf(key) !== -1 || key.substring(0,8) === 'fulcrum_'){
                                return;
                            }
                            if(key === 'Type'){
                                key = 'Layer';
                                value = self._config.description;
                            }
                            table.append("<tr><th>" + key + "</th><td>" + value + "</td></tr>");
                        });
                        rowsLeft--;
                        if(rowsLeft > 0){
                            table.append(breaker);
                        }
                    });
                    res = table;
                }catch(e){
                    if (res.indexOf("<table") !== -1){
                        content = $(res).closest('table'); 
                        content.addClass('table table-striped table-bordered table-condensed');
                        var caption = content.find('caption');
                        caption.text(self._config.description);

                        var headerCells = content.find('th');
                        var dataRows = content.find('tr').toArray();
                        dataRows.shift(); // pop off the header row

                        // Find where any blacklisted fields are at so we can remove them
                        var spliceOut = [];
                        for(var i = 0;i<headerCells.length;i++){
                            if(blacklistedAttributes.indexOf($(headerCells[i]).text()) !== -1){
                                spliceOut.push(i);
                            }
                        }
                        
                        for(var s = spliceOut.length;s>0;s--){
                            headerCells.splice(s - 1,1);
                        }

                        table = $("<table class='table table-striped table-bordered table-condensed'>");
                        var r;
                        while(dataRows.length > 0){
                            r = dataRows.shift();
                            var dataCells = $(r).find('td');

                            for(s = spliceOut.length;s>0;s--){
                                dataCells.splice(s - 1,1);
                            }

                            for(i = 0;i<headerCells.length;i++){
                                table.append("<tr><th>" + $(headerCells[i]).text() + "</th><td>" + $(dataCells[i]).text() + "</td></tr>");
                            }

                            if(dataRows.length > 0){
                                table.append(breaker);
                            }
                        }

                        res = table;
                    }else if(res.indexOf('<body') !== -1){
                        res = [];
                    }else{
                        res = $(res);
                    }
                }

                if(self.GC.util.isEmpty(res[0])){
                    res = ["Nothing found here in the " + self._config.description + " layer"];
                }
                var popup = L.popup({maxHeight:250,minWidth:300}).setContent(res[0]).setLatLng(e.latlng);
                self.GC.map.map.openPopup(popup);
            },
            function(failure){
                console.log('WMS Request failed somehow');
            }); 
    }
};
