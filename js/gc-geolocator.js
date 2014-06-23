// TODO: Replace with new bootleaf built-in location support
GC.Geolocator = function(gc){
    if(!navigator.geolocation){
        console.log("Geolocation not supported by " + navigator);

        this.afterUpdate.reject(self);
        this.getCurrentPosition = function(){return this.afterUpdate;};
        this.watchPosition= function(){return this.afterUpdate;};
    }

    this.GC = gc;

    // Coords has:
    // * latitude
    // * longitude
    // * accuracty
    // * altitude
    // * altitudeAccuracy
    // * heading
    // * speed
    // * timestamp
    this.coords = null;
    this.timestamp = false;
    this.lastError = false;
    this.maxAge = 600000; // Max age of geocode results in milliseconds. 10 minutes
    this.currentAccuracyCircle = null;
    this.currentLocationPoint = null;
    this.keepCurrentUpdated = true;  // Should we keep moving the current-location circle? 
    this.followCurrentLocation = true; // Should we keep panning the map to follow the circle?
};

GC.Geolocator.prototype = {

    // Request a location update. Returns a promise so we can chain events
    getCurrentPosition:function(scope){
        var self = this;
        
        // If we're within the maxAge, resolve the promise and return it
        if(self.timestamp !== false && (new Date().getTime() - self.timestamp) < self.maxAge){
            return self._handleUpdate(self,self,self);
        }

        // Otherwise make a new geolocation request and return the promise
        self.afterUpdate = new $.Deferred();
        navigator.geolocation.getCurrentPosition(
            function(success){
                return self._handleUpdate(self,success,scope);
            },
            function(failure){
                return self._handleUpdateError(self,failure,scope);
            },{enableHighAccuracy:true}
            // ,
            // {
            //     enableHighAccuracy: false,
            //     timeout: milliseconds,
            //     maximumAge: 0
            // }
        );
        return self.afterUpdate;
    },
    watchPosition:function(){
        var self = this;
        navigator.geolocation.watchPosition(function(success){
            return self._handleUpdate(self,success);
        });
    },
    drawPosition:function(){
        if(this.currentAccuracyCircle === null){
            this.currentAccuracyCircle = new L.Circle([this.coords.latitude,this.coords.longitude],this.coords.accuracy,{
                // stroke
                weight:1.0,
                color:'#130085',
                opacity:0.6,

                // fill
                fillColor:'#130085',
                fillOpacity:0.1
            });

            this.currentLocationPoint  = new L.Circle([this.coords.latitude,this.coords.longitude],0.5,{
                color:'#130085',
                fillColor:'#130085',
                weight:4.0
            });

            // Switched to CSS animations. Won't work in IE9, but they'll still get a static image, so that's OK, right?
            // var self = this;
            // this._pulsateInterval = setInterval(function(){
            //     var newWeight = parseFloat(self.currentLocationPoint.options.weight);
            //     newWeight += (parseInt(newWeight * 100) % 25 == 0 ? 0.25 : -0.25);
            //     newWeight = (newWeight < 0 ? 0 : (newWeight > 20 ? 19.74 : newWeight));
            //     self.currentLocationPoint.setStyle({weight:newWeight}); 
            // },100);

            this.currentAccuracyCircle.addTo(this.GC.map.map);
            this.currentLocationPoint.addTo(this.GC.map.map);

            var currentClass = $(this.currentLocationPoint._path).attr('class');
            $(this.currentLocationPoint._path).attr('class', currentClass + ' pulsate');
            this.GC.map.map.fitBounds(this.currentAccuracyCircle.getBounds());
        }else{
            this.currentAccuracyCircle.setLatLng([this.coords.latitude,this.coords.longitude]);
            this.currentLocationPoint.setLatLng([this.coords.latitude,this.coords.longitude]);
            this.currentAccuracyCircle.setRadius(this.coords.accuracy);
            if(this.followCurrentLocation){
                // This would let you re-center AND re-zoom
                // this.GC.map.map.fitBounds(this.currentAccuracyCircle.getBounds());
                this.GC.map.map.panTo(this.currentLocationPoint.getLatLng());
            }
        }
    },
    _handleUpdate:function(self,position,scope){
        self.coords = position.coords;
        self.timestamp = position.timestamp;
        self.lastError = false; 
        if(self.keepCurrentUpdated){
            self.drawPosition();
        }
        self.afterUpdate.resolve(self,scope);
        return self.afterUpdate;
    },
    _handleUpdateError:function(self,error,scope){

        // Remove the current location if we're getting errors and our current location has expired
        if(this.currentAccuracyCircle !== null && self.timestamp && (new Date().getTime() - self.timestamp) < self.maxAge){
            clearInterval(self._pulsateInterval);
            self.GC.map.map.removeLayer(this.currentAccuracyCircle);
            self.GC.map.map.removeLayer(this.currentLocationPoint);
            this.currentLocationPoint = null;
            this.currentAccuracyCircle = null;
        }
        
        self.timestamp = false;

        switch(error.code)
        {
            case error.PERMISSION_DENIED:
                self.lastError = "User denied the request for Geolocation.";
                break;
            case error.POSITION_UNAVAILABLE:
                self.lastError = "Location information is unavailable.";
                break;
            case error.TIMEOUT:
                self.lastError = "The request to get user location timed out.";
                break;
            case error.UNKNOWN_ERROR:
                self.lastError = "An unknown error occurred.";
                break;
        }
        self.afterUpdate.reject(self,scope);
        return self.afterUpdate;
    },
    afterUpdate: new $.Deferred()
};
