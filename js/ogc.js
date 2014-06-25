/*
* This is the starting point for the GeoCruncher application
*
* OGC modules should be loaded in separate files for tidyness
*
* After page load any OGC modules will have their init methods called
*   - Maybe we should do something with promises so that modules can be dependent on each other but run ASAP
*/


var OGC = function(config){
    // Settings
    this.baseUrl = '';
    this.debug = true;

    // These are set elsewhere
    this.appInst = null;
    this.eventFilterLayer = null;
    this.eventFilterName = null;
    this.logo = null;
    this.projectName = null;

    config = config || {};
    for(var i in config){
        this[i] = config[i];
    }

    this.util = new OGC.Util();
    this.user = new OGC.User(this);
    this.map = new OGC.Map(this);
};

OGC.prototype = {
    useAppInst:function(appInst){
        return this.user.useAppInst(appInst);
    }
};
