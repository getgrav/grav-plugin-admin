$(document).ready(function(){
    var large_desktop_container =		75.000;
    var desktop_container=				60.000;
    var tablet_container=				48.000;
    var large_mobile_container=		   30.000;

    var mobile_only= large_desktop_container - 0.062;
    var no_mobile= tablet_container;
    var small_mobile_range= large_mobile_container;
    
    var menu_state = "closed";

        var admin_sidebar = document.getElementById("admin-sidebar");
        var overlay = document.createElement("div");
            overlay.id = "overlay";
            overlay.style.position = 'fixed';
            overlay.style.width = '25%';
            overlay.style.height = '100%';
            overlay.style.zIndex = 999999;
            overlay.style.left = '75%';
        document.body.getElementsByClassName('remodal-bg')[0].appendChild(overlay);
        document.getElementById('overlay').style.display = 'none';
        var selected = admin_sidebar.getElementsByClassName("selected")[0].getElementsByTagName("a");
        //add listener to titlebar to acivate sidebar
        document.getElementById("titlebar").addEventListener("click",function(){
            if($(window).width() / parseFloat($("body").css("font-size"))<mobile_only && menu_state=="closed") {
                //open sidebar
                console.log(menu_state);
                $(admin_sidebar).toggle("slide");
                document.getElementById('overlay').style.display = 'inherit';
                selected[0].href="javascript:void(0)";
                menu_state = "open";
                console.log(menu_state);
            }
        });

        //enable sidebar closing;
        admin_sidebar.addEventListener("click", function(event){
            if($(window).width() / parseFloat($("body").css("font-size"))<mobile_only && menu_state == "open") {
                if(event.target == admin_sidebar || event.target == selected[0]){
                    console.log(menu_state);
                    $(admin_sidebar).toggle("slide");
                    document.getElementById('overlay').style.display = 'none';
                    menu_state = "closed";
                    console.log(menu_state);
                }
            }
        });
        document.getElementById('overlay').addEventListener("click", function(event){
            if($(window).width() / parseFloat($("body").css("font-size"))<mobile_only && menu_state == "open") {
                console.log(menu_state);
                $(admin_sidebar).toggle("slide");
                document.getElementById('overlay').style.display = 'none';
                menu_state = "closed";
                console.log(menu_state);
            }
        });
});

