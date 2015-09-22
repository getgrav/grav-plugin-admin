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

    var mobile = {
        setup: function() {
            //add event listeners
            titlebar.addEventListener('click',mobile.titlebar_click);
            sidebar.addEventListener('click',mobile.sidebar_click);
            overlay.addEventListener('click',mobile.overlay_click);
        },
        teardown: function() {
            //remove event listeners
            titlebar.removeEventListener('click',mobile.titlebar_click);
            sidebar.removeEventListener('click',mobile.sidebar_click);
            overlay.removeEventListener('click',mobile.overlay_click);
        },
        titlebar_click: function(event){
            //titlebar on click - open sidebar (make sure not a button bar child)
            if(!$(event.target).parents('.button-bar').length>0){
                $(sidebar).toggle('slide');
                overlay.style.display = "inherit";
            }
        },
        sidebar_click: function(){
            //sidebar on click - close sidebar
            if(event.target == sidebar || event.target == selected[0]) {
                $(sidebar).toggle('slide');
                overlay.style.display = "none";
            }
        },
        overlay_click: function(){
            //overlay on click - close sidebar
            $(sidebar).toggle('slide');
            overlay.style.display = "none";
        }
    };

    var other = {
        setup: function() {
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
