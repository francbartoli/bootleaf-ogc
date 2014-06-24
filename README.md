Bootleaf App!
============
This is an app that implements user modules and WFS searching on top of Bootleaf.

It also adds user authentication.

Layers can be specified as queriable or not. 

It is a work in progress as is the documentation. 


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


Install/Setup
-------------
Check this app out into a directory named 'gc' in the base directory of your Bootleaf install (next to the assets directory).

Index.html is a copy of bootleaf's index.html file with a block of changes. 

The changes are to replace the 
    
    <script src="assets/leaflet-0.7.2/leaflet.js"></script>

with 

    <!-- 
        GC changes 
        Find the <script> tag referencing leaflet.js
        Replace it with the GC code
    -->
    <!-- script src="assets/leaflet-0.7.2/leaflet.js"></script -->
    <script src="//api.tiles.mapbox.com/mapbox.js/v1.6.4/mapbox.js"></script>
    <link rel="stylesheet" href="gc/css/gc.css">
    <script src="gc/js/gc.js"></script>
    <script src="gc/js/gc-layerConfig.js"></script>
    <script src="gc/js/gc-map.js"></script>
    <script src="gc/js/gc-maplayer.js"></script>
    <script src="gc/js/gc-module.js"></script>
    <script src="gc/js/gc-user.js"></script>
    <script src="gc/js/gc-util.js"></script>
    <script src="gc/js/gc_init.js"></script>
    <!-- End of GC Changes -->

