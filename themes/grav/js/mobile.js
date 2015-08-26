$(document).ready(function(){
    var large_desktop_container =		75.000;
    var desktop_container=				60.000;
    var tablet_container=				48.000;
    var large_mobile_container=		   30.000;

    var mobile_only= large_desktop_container - 0.062;
    var no_mobile= tablet_container;
    var small_mobile_range= large_mobile_container;

    //mobile-only actions
    if($(window).width() / parseFloat($("body").css("font-size"))<mobile_only) {
        //add listener to titlebar to acivate sidebar
        document.getElementById("titlebar").addEventListener("click",function(){
            //open sidebar
            var admin_sidebar = document.getElementById("admin-sidebar");
            $(admin_sidebar).toggle("slide");

            //enable sidebar closing;
            admin_sidebar.addEventListener("click", function(event){
                if(event.target == admin_sidebar){
                    $(admin_sidebar).toggle("slide");
                }
            });
        });
        //If updates available variable hide after x milliseconds
        if($("#admin-main > .grav-update").length > 0){
            var oldTop = $("#admin-main > .content-padding").css('top');
            console.log(oldTop);
            console.log($("#admin-main > .content-padding").css('top','11.2rem'));
            $("#admin-main > .grav-update").delay(5000).fadeOut(500);
            $("#admin-main > .content-padding").delay(5000).queue(function(){$(this).css('top', oldTop);});
        }

    }
});
