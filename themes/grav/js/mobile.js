$(document).ready(function(){
        document.getElementById("titlebar").addEventListener("click",function(){
            var admin_sidebar = document.getElementById("admin-sidebar");
            if($("div.titlebar > h1 > i").css("content") == "bars"){
                $(admin_sidebar).toggle("slide");
                console.log("hello");
            }
            console.log("hello2");
            console.log($("div.titlebar>h1>i").css("content"));
        });
        document.getElementById("admin-sidebar").addEventListener("click",function(event){
            var admin_sidebar = document.getElementById("admin-sidebar");
            if((screen.width > 320 && screen.width< 480) || (screen.height > 320 && screen.height < 480)){
                if(event.target == admin_sidebar){
                    $(admin_sidebar).toggle("slide");
                }
            }
            //$(admin_sidebar).toggle("slide");
        });
});
