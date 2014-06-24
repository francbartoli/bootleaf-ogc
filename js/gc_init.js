// The following is initialization code and should probably go somewhere else

var baseUrl = 'gc/mockServer/';

initialLoginStatusPromise = $.post(baseUrl + 'login/status',null,null,'json');

// This function adds in HTML elements and IDs to the default bootleaf html
// If you create static HTML with these elemnts you could get rid of this, 
function gc_add_html(){
    // Give the login form button an ID
    $('.modal-footer button').attr('id','modal-footer-login-button');

    // Give the login menu an ID
    $('.fa-user').closest('li').attr('id','loginmenu');
    
    // Add a logout menu 
    $('#loginmenu').after("<li id='logoutmenu' class='hidden'><a href='#' data-toggle='collapse' data-target='.navbar-collapse.in'><i class='fa fa-user'></i>&nbsp;&nbsp;Logout</a></li>");

    // Add login error message
    $('#username').closest('fieldset').prepend("<div class='form-group has-error hidden'><div class='control-label' id='loginerror'><p>Your login or password were incorrect.</p><p>To have your password reset, please contact <a href='mailto:support@example.net?subject=Login help'>support@example.net</a>.</p></div></div>");

    // Add our layer switcher
    $('#toolsDrop').parent().after("<li class='dropdown'><a id='toolsDrop' href='#' role='button' class='dropdown-toggle' data-toggle='dropdown'><i class='fa fa-globe' style='color: white'></i>&nbsp;&nbsp;Map Layers<b class='caret'></b></a><ul class='dropdown-menu nav-list'><li id='baselist' class='hidden-xs'>Basemaps</li><li id='overlayslist' class=''>Overlays</li></ul></li>");

}

$(document).ready(function(){
    gc_add_html();

    G = window.G = new GC({baseUrl:baseUrl});

    G.user.whenAuthenticated.then(function(){
        G.useAppInst('maplayers'); 
    });

    initialLoginStatusPromise.then(function(success){
        // Not sure what's still happening when this runs, but we need to delay so we're not setting bounds twice
        var f = function(){G.user._handleAuthenticationSuccess(success);};
        setTimeout(f,500);
    });
});
