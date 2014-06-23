/*
 * A module is a collection of related layers and forms. 
 *
 * If it includes basemaps, its own basemaps override the basemaps of the default moduile
 *
 * One or more clickable layers may be present. Clickable layers can be shown and hidden and a
 * single clickable layer can be made active so that its getfeatureinfo (or equivalent) results
 * will be displayed.
 */

GC.Module = function(gc,args){
    this.GC = gc;
    this.module_id = args.module_id;
    this.name = args.name;
    this.appinst = args.appinst;
    this.maplayers = {};
    this.mapConfig = args.mapConfig;
    this.activelayer = null;
    this.ready = new $.Deferred();
};

GC.Module.prototype = {
    activate:function(){
        var self = this;

        if(self.ready.state() === 'resolved'){
            return self._activate(self);
        }

        return self.loadModuleData().then(self._activate);
    },

    loadModuleData:function(){
        var self = this;

        if(this.ready.state() === 'resolved'){
            return self.GC.util.fakePromise(self);
        }

        return $.getJSON(this.GC.baseUrl + 'login/changeModule/' + this.appinst + '/' + this.module_id).then(
            function(success){
                self.addLayers(success.layerConfig,self.appinst);
                self.mapConfig = success.mapConfig;
                self.ready.resolve(self);
                return self;
            },
            function(failure){
                console.log("Failed to load module data for module " + this.appinst + '/' + this.module_id);
                console.log(failure);
            }
        );
    },


    // The real activate function
    _activate: function(self){
        self = self || this;

        var layersToRemove = $('li.maplayer').map(function(i,layer){
            if($(layer).attr('data-appinst') != 'master' && $(layer).attr('data-appinst') != self.name){
                return $(layer).attr('data-layerid');
            }
        });

        self.GC.map.setConfig(self.mapConfig);
        self.GC.map.removeLayers(layersToRemove);
        self.GC.appInst = self.appinst;
        self.GC.user.activeModule = self;
        return self.GC.util.fakePromise(self.name);
    },

    addLayers:function(layerConfigs){
        var layer;
        for(var i = 0;i<layerConfigs.length;i++){
            this.maplayers[layerConfigs[i].layer_id] = new GC.MapLayer(this.GC,this,layerConfigs[i]);
        }
    },

    baseMaps:function(){
        if(this.ready.state() !== 'resolved'){
            console.log("WARNING: We're not ready yet!");
            return [];
        }
        
        var basemaps = [];
        for(var x in this.maplayers){
            if(this.maplayers[x].isBasemap()){
                basemaps.push(this.maplayers[x]);
            }
        }
        return basemaps;
    },

    overlays:function(){
        if(this.ready.state() !== 'resolved'){
            console.log("WARNING: We're not ready yet!");
            return [];
        }

        var overlays = [];
        for(var x in this.maplayers){
            if(!this.maplayers[x].isBasemap()){
                overlays.push(this.maplayers[x]);
            }
        }
        // Return in display order
        overlays.sort(function(a,b){
            return a._config.display_order - b._config.display_order;
        });
        return overlays;
    },

    handleClick:function(e){
        if(this.activelayer !== null){
            this.activelayer.handleClick(e);
        }
    }
};
