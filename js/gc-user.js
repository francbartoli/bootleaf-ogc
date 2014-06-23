/*
* User state and functions
*
* Handles user login/logout actions including initializing default module
* and adding action handlers to the login form elements
*/

// The constructor
GC.User = function(gc){
    this.GC = gc;
    var self = this;

    this.userName = null;
    this.displayName = null;
    this.title = null;
    this.name = null;
    this.modules = {};
    this.activeModule = null;


    $('#loginModal').on({
        'shown.bs.modal': function(e){
            self.GC.util.focusAtEnd('#username');
        },
        'hide.bs.modal': function(e){
            if(self.whenAuthenticated.state() !== 'resolved'){
                e.preventDefault();
            }
        }
    }).modal('show');


    $('#username').on('keydown',this,function(e){
        if([13,32,186,188].indexOf(e.which) !== -1){
            self.GC.util.focusAtEnd('#password');
        }
    });

    // Do login on Return when in password box
    $('#password').on('keydown',this,function(e){
        if([13,32,186,188].indexOf(e.which) !== -1){
            self.authenticate(e);
        }  
    });

    // Set up login and logout buttons
    $('#modal-footer-login-button').on('click',this,this.authenticate);
    $('#logoutmenu').on('click',this,this.logout);
};

GC.User.prototype = {
    whenAuthenticated : new $.Deferred(),
    authenticate:function(un,pw){
        var self;
        if(typeof un == 'object'){
            self = un.data;
            un = $('#username').val();
            pw = $('#password').val();
        }else{
            self = this;
        }

        return $.post(self.GC.baseUrl + 'login/authenticate',{userEmail:un,userPassword:pw},null,'json').then(
            function(success){
                self._handleAuthenticationSuccess(success);
            },
            function(failure){
                self.whenAuthenticated.reject();
                $('#username').parent().addClass('has-error');
                $('#password').parent().addClass('has-error');
                $('#loginerror').parent().removeClass('hidden');
                $('#username').focus();
                self.whenAuthenticated = new $.Deferred();
            }
        );
    },

    _handleAuthenticationSuccess: function(success){
        var self = this;

        $('#username').parent().removeClass('has-error');
        $('#password').parent().removeClass('has-error');
        $('#loginerror').parent().addClass('hidden');
        $('#loginmenu').addClass('hidden');
        $('#logoutmenu').removeClass('hidden');

        self.GC.eventFilterLayer = success.eventFilterLayer;
        self.GC.eventFilterName = success.eventFilterName;
        self.GC.logo = success.logo;
        self.GC.projectName = success.projectName;

        self.userName = success.userName;
        self.displayName = success.displayName;
        self.title = success.title;

        // Initialize all modules
        for(var i = 0;i<success.userModules.length;i++){
            self.modules[success.userModules[i].appinst] = new GC.Module(self.GC,success.userModules[i]); 
        }

        // Add extra data to current modules
        if(typeof self.modules[success.appInst] == 'undefined'){
            self.modules[success.appInst] = new GC.Module(self.GC,{
                module_id: parseInt(success.mapConfig.module_id,10),
                name: (success.appInst == 'master' ? 'Default' : success.appInst),
                appinst: success.appInst,
                mapConfig: success.mapConfig
            });
        }else{
            // already defined, just add some data
            self.modules[success.appInst].mapConfig = success.mapConfig;
        }
        self.modules[success.appInst].addLayers(success.layerConfig,success.appInst);
        self.modules[success.appInst].ready.resolve(self.modules[success.appInst]);

        // Ensure that the master module exists
        var masterPromise = false;
        if(typeof self.modules.master == 'undefined'){
            self.modules['master'] = new GC.Module(self.GC,{
                module_id: 99,
                name: 'Default',
                appinst: 'master'
            });
            masterPromise = self.modules.master.loadModuleData();
        }

        // Activate the success.appInst module, then use it when it's ready
        var promises;
        if(masterPromise === false){
            promises = self.GC.util.fakePromise(self);
        }else{
            promises = masterPromise;
        }
        promises.then(function(worked){
            self.modules[success.appInst].activate();
        });
        promises = promises.then(function(worked){
            return self.modules.master.activate();
        });
        promises = promises.then(function(worked){
                return self.GC.map.useAppInst(success.appInst);
        });
        return promises.then(function(worked){
            self.whenAuthenticated.resolve();
            $('#loginModal').modal('hide');
            $("#loading").hide();
            self.whenAuthenticated = new $.Deferred();
        });
    },

    // Load an appinst's data 
    // AppInst/module -- TODO: Reconcile old naming (appInst) and new naming (module)
    useAppInst:function(appinst){
        var self;
        if(typeof appinst == 'object'){
            self = appinst.data;
            console.log("TODO: Have list of modules somewhere. Get appinst value from data-appinst of target");
        }else{
            self = this;
        }

        if(typeof self.modules[appinst] !== 'undefined'){
            return self.modules[appinst].activate().then(function(){
                self.activeModule = self.modules[appinst];
                self.GC.appInst = appinst;
                self.GC.map.useAppInst(self.GC.appInst);
            });
        }else{
            return $.Deferred().reject();
        }
    },

    logout:function(e){
        var self = e.data;
        $.post(self.GC.baseUrl + 'login/logout').then(
            function(success){
                // Just reload the page to re-init everything
                window.location.reload();
            },
            function(failure){
                alert("Failed to log out. Now what?");
            });
    }
};
