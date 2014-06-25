/*
* All map functions for ogc
*/
OGC.Map = function(ogc){
    this.OGC = ogc;

    // TODO check if map is already initialized
    if(typeof map === 'object' && typeof map._leaflet_id !== 'undefined'){
        this.map = map;
    } else {
        this.map = L.map('map');
    }

    // this.sidebar = L.control.sidebar("sidebar", {
    //     closeButton: true,
    //     position: "left"
    // }).addTo(this.map);

    this.map.on('click',this.handleClick,this);

    $('.zoom-to-full-extent').on('click',this,this.zoomToFullExtent);

    // config settings
    this.defaultfeaturezoom = null;

    this.defaultmaplat = null;
    this.defaultmaplon = null;

    this.defaultmapzoom = null;

    this.display_projection = null;

    this.mapframe_id = null;

    this.maxextentx1 = null;
    this.maxextentx2 = null;
    this.maxextenty1 = null;
    this.maxextenty2 = null;

    this.maxresolution = null;

    this.numzoomlevels = null;
    this.projection = null;
    this.units = null;
};

OGC.Map.prototype = {
    setConfig:function(mapConfig){

        mapConfig = mapConfig || this;

        for(var x in mapConfig){
            this[x] = mapConfig[x];
        }  

        var bounds = [[mapConfig.maxextenty1,mapConfig.maxextentx1],[mapConfig.maxextenty2,mapConfig.maxextentx2]];
        this.map.setMaxBounds(bounds);
        // this.map.fitBounds(bounds);
        this.map.panTo([mapConfig.defaultmaplat,mapConfig.defaultmaplon]);
        this.map.setZoom(mapConfig.defaultmapzoom);
    },

    removeLayers:function(layers){
        for(var i = 0;i<layers.length;i++){
            this.map.removeLayer(layers[i]);
        }
    },

    zoomToFullExtent:function(){
        var self;
        if(arguments.length > 0 && typeof arguments[0].data == 'object'){
            self = arguments[0].data;
        }else{
            self = this;
        }
        self.map.fitBounds([[self.maxextenty1,self.maxextentx1],[self.maxextenty1,self.maxextentx2]]);
    },

    baseMaps:function(){
        var idsSeen = [];
        var basemaps = [];
        var i;

        if(this.OGC.appInst !== 'master' && this.OGC.appInst !== null){
            basemaps = this.OGC.user.modules[this.OGC.appInst].baseMaps();
            for(i = 0;i<basemaps.length;i++){
                idsSeen.push(basemaps[i]._config.layer_id);
            }
        }

        var masterbasemaps = this.OGC.user.modules.master.baseMaps();
        for(i = 0;i<masterbasemaps.length;i++){
           if($.inArray(masterbasemaps[i]._config.layer_id,idsSeen) === -1){
                basemaps.push(masterbasemaps[i]);
                idsSeen.push(masterbasemaps[i]._config.layer_id);
           }
        }

        basemaps.sort(this._layerSortFunction);

        return basemaps;
    },

    _layerSortFunction: function(a,b){
       if(typeof a._config.display_order !== 'undefined' && typeof b._config.display_order !== 'undefined'){
                return a._config.display_order - b._config.display_order;
            }else{
                // If either of the layers doesn't have a display_order, don't move them
                return 0;
            }
    },

    overlays:function(){
        var idsSeen = [];
        var overlays = [];
        var i;
        
        if(this.OGC.appInst !== 'master' && this.OGC.appInst !== null){
            overlays = this.OGC.user.modules[this.OGC.appInst].overlays();
            for(i = 0;i<overlays.length;i++){
                idsSeen.push(overlays[i]._config.layer_id);
            }
        }

        var masteroverlays = this.OGC.user.modules.master.overlays();
        for(i = 0;i<masteroverlays.length;i++){
           if($.inArray(masteroverlays[i]._config.layer_id,idsSeen) === -1){
                overlays.push(masteroverlays[i]);
                idsSeen.push(masteroverlays[i]._config.layer_id);
           }
        }

        overlays.sort(this._layerSortFunction);

        return overlays;
    },

    useAppInst:function(appInst){
        var basemaps = this.baseMaps();
        var overlays = this.overlays();
        $('.maplayerlist').remove();

        var havebase = false;
        var elem;
        var i;

        // Use reverse for loop so that our layers are added to the list in layer order
        for(i=basemaps.length;i>0;){
            i--;
            if(basemaps[i]._config.displayinlayerswitcher){
                elem = $("<li data-layerid='"+basemaps[i]._config.layer_id+"' data-appinst='" + appInst + "' class='maplayerlist'><a href='#'><input type='radio' name='baseradio'/>"+ basemaps[i]._config.description +"</a></li>");
                elem.bind('click',basemaps[i],basemaps[i].show);
                $('#baselist').after(elem);
            }
            if(basemaps[i]._config.visibility){
                if(basemaps[i].show()){
                    havebase = true;
                }
            }
        }

        // Ensure at least one basemap
        if(!havebase && basemaps.length > 0){
            basemaps[0].show();
        }

        for(i=overlays.length;i>0;){
            i--;
            if(overlays[i]._config.displayinlayerswitcher){
                elem = $("<li data-layerid='"+overlays[i]._config.layer_id+"' data-appinst='" + appInst + "' class='maplayerlist'><a href='#'><input type='checkbox'/>"+ overlays[i]._config.description +"</a></li>");
                elem.bind('click',overlays[i],overlays[i].show);
                $('#overlayslist').after(elem);
            }
            if(overlays[i]._config.visibility){
                overlays[i].show();
            }
        }
    },

    removeBasemaps:function(){
        var l;
        for(var x in this.map._layers){
            if(this.map._layers[x].options !== undefined && this.map._layers[x].options.maplayer !== undefined && this.map._layers[x].options.maplayer.isBasemap()){
                this.map.removeLayer(this.map._layers[x]);
            }  
        }
    },

    handleClick:function(e){
        if(this.OGC.user.activeModule !== null){
            this.OGC.user.activeModule.handleClick(e);
        }
    }
};
