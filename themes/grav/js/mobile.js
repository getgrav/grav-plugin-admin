$(document).ready(function(){
    var large_desktop_container =		75.000;
    var desktop_container=				60.000;
    var tablet_container=				48.000;
    var large_mobile_container=		   30.000;

    var mobile_only= tablet_container - 0.062;
    var no_mobile= tablet_container;
    var small_mobile_range= large_mobile_container;

    var media_mobile = window.matchMedia('(max-width:' + mobile_only + 'em)');

    var titlebar = document.getElementById("titlebar");
    var sidebar = document.getElementById("admin-sidebar");
    var overlay = document.getElementById("overlay");

    //var selected = sidebar.getElementsByClassName('selected')[0].getElementsByTagName('a');
    //Var selected will be added later when solution to a few pages not having it is found.
    //Var selected is used to prevent the page from reloading when clicking on the current page in the menu
    var mobile = {
        setup: function() {
            //selected[0].href = 'javascript:void(0)';
            //actions here please;
            //console.log("Mobile setup");
            //event listener to titlebar
            titlebar.addEventListener('click',mobile.titlebar_click);
            //event listener to admin-sidebar
            sidebar.addEventListener('click',mobile.sidebar_click);
            //event listener to overlay
            overlay.addEventListener('click',mobile.overlay_click);
        },
        teardown: function() {
            //teardown actions here please
            //console.log("Mobile teardown");
            //remove event listeners
            titlebar.removeEventListener('click',mobile.titlebar_click);
            sidebar.removeEventListener('click',mobile.sidebar_click);
            overlay.removeEventListener('click',mobile.overlay_click);
        },
        titlebar_click: function(event){
            //onclick event stuff here;
            //console.log("Mobile onClick");
            if(!$(event.target).parents('.button-bar').length>0){
            $(sidebar).toggle('slide');
            overlay.style.display = "inherit";
            }
        },
        sidebar_click: function(){
            //onclick event stuff here;
            //console.log("Sidebar Clicked");
            if(event.target == sidebar || event.target == selected[0]) {
                $(sidebar).toggle('slide');
                overlay.style.display = "none";
            }
        },
        overlay_click: function(){
            //onclick event stuff here;
            //console.log("Overlay Clicked");
            $(sidebar).toggle('slide');
            overlay.style.display = "none";
        }
    };

    var other = {
        setup: function() {
            //actions here please;
            //console.log("Other setup");
            //make sure menu is visible
            if(sidebar && sidebar.style.display == 'none') {
                sidebar.style.display = 'block';
            }
        },
        teardown: function() {
            //teardown actions here please
            //console.log("Other teardown");
        },
        onClick: function(){
            //onclick event stuff here;
            //console.log("Other onClick");
        }
    };

    media_mobile.addListener(function(data) {
        if(data.matches) {
            other.teardown();
            mobile.setup();
        } else {
            mobile.teardown();
            other.setup();
        }
    });

    if (media_mobile.matches) {
        mobile.setup();
    } else {
        other.setup();
    }
});
