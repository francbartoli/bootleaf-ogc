Bootleaf OGC!
============
This is an app is working to support OGC supported servies (WMS, WFS, etc.) on top of Bootleaf.

It also adds support for user authentication and modules.

Layers can be specified as queriable or not. 

It is a work in progress as is the documentation. 

DEMO!
-----
You can [try the Bootleaf-OGC demo here](http://flatrockgeo.github.io/bootleaf-ogc/ogc.html). 

It doesn't actually hit an authentication server, so use any username/password you wish.


Definitions
-----------
Module -- Modules are collections of layers some of which may be queryible. Users
may have access to multiple modules

Layers -- Various types of layers are/will be supported. Currently Mapbox and WMS layers
are implemented. WFS and other types will be added in the future. 


Notes
-----
There is a single master module (name: Default, ID: 99) which all other modules 
inherit from. All modules have access to the master layers and if no more
specific map bounds are given the module uses the default bounds. 

In some places modules are referred to as 'appinst'. This is a legacy holdover from a
previous mapping system and will be phased out in a future version.

We replace leaflet.js with mapbox.js. Mapbox.js provides leaflet along with mapbox support.

This currently (June 25, 2014) works with Bootleaf commit 363156f5b94dbe1dbe43c72033a53d8321a900e9. 


Install/Setup
-------------
Check this app out into a directory named 'ogc' in the base directory of your Bootleaf install (next to the assets directory).

Index.html is a copy of bootleaf's index.html file with a block of changes. 

The changes are to replace the 
    
    <script src="assets/leaflet-0.7.3/leaflet.js"></script>

with 


    <!-- 
        ogc changes 
        Find the <script> tag referencing leaflet.js
        Replace it with the ogc code
    -->
    <!-- script src="//api.tiles.mapbox.com/mapbox.js/v1.6.4/mapbox.uncompressed.js"></script -->
    <script src="//api.tiles.mapbox.com/mapbox.js/v1.6.4/mapbox.js"></script>
    <link rel="stylesheet" href="ogc/css/ogc.css">
    <script src="ogc/js/ogc.js"></script>
    <script src="ogc/js/ogc-layerConfig.js"></script>
    <script src="ogc/js/ogc-map.js"></script>
    <script src="ogc/js/ogc-maplayer.js"></script>
    <script src="ogc/js/ogc-module.js"></script>
    <script src="ogc/js/ogc-user.js"></script>
    <script src="ogc/js/ogc-util.js"></script>
    <script src="ogc/js/ogc_init.js"></script>
    <!-- End of ogc Changes -->


You may wish to include a script other than ogc_init.js which refers to your own login server
