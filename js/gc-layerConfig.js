/*
 * Each map layer has a layerConfig. 
 *
 * The user's default module's LayerConfigs are returned with the initial user login results 
 *
 * Other LayerConfigs are returned as the user switches modules
 */

GC.LayerConfig = function(args){
    this.api_key = null;
    this.appinst = null;
    this.bing_type = null;
    this.description = null;
    this.display_order = null;
    this.displayinlayerswitcher = null;
    this.format = null;
    this.isbaselayer = null;
    this.layer_id =null;
    this.layer_name = null;
    this.layer_type =null;
    this.layer_url = null;
    this.module_id = null;
    this.opacity = null;
    this.query_type = null;
    this.singletile = null;
    this.transparent = null;
    this.visibility = null;
    this.websql = null;
    this.bucket = null;

    for(var x in args){
        this[x] = args[x];
    }

    //module_layer_id = function(){
    //    return this.get('module_id') + '_' + this.get('layer_id');
    //}.property('module_id','layer_id'),
    //isDefaultbaselayer = function(){

    //    if (this.get('isbaselayer') === true && this.get('display_order') == 1){
    //        return true;
    //    }

    //    else {
    //        return false;
    //    }
    //    
    //}.property('isbaselayer','display_order'),

    ////get rid of workspace name for matching up WMS getfeatureinfo reqs
    //wms_layer_name = function(){
    //    if (this.get('layer_name').split(' =').length >1){
    //        return this.get('layer_name').split(' =')[1];
    //    }

    //    else{
    //        return this.get('layer_name');
    //    }
    //}.property('layer_name')
};
