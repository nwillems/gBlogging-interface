
//Google defined URLS
var G = {
    "BLOGGER" : { //Blogger as sub is added to make room for integrating with other services
        "AUTH_URL" : "https://www.blogger.com/feeds",
        "LIST_URL" : "https://www.blogger.com/feeds/default/blogs"
    }
};

var Blogging = {
    service : null,
//Global Variables
//  Current Blog
    currentBlog : -1,
//  Current Post
    currentPost : -1,
// Array of users blogs
    blogs : [],
// Array of postFeeds - in same order as blogs
    blogFeeds : [],
// A reference to the editor object wrapping the textarea
    editorReference : {}
}

/**
 * Error handling function - can handle both strings and real error objects
 */
function handleError(error){
    if(typeof error == 'string'){ $("#error").html(error);
    }else{ // Assume real error
        $("#error").text(
            error.cause ? error.cause.statusText : error.message
        );
    }
}

/**
 * Function that gets the current users blogs
 */
function loadBlogs(){
    var query = new google.gdata.blogger.BlogQuery(G.BLOGGER.LIST_URL);
    Blogging.service.getBlogFeed(query, handleLoadBlogs, handleError);
}

/**
 * Handles when the query for blogs returns.
 * It should update the blog-dropdown and ask google to start loading the
 * blog-posts
 */
function handleLoadBlogs(resultFeed){
   var feed = resultFeed.feed;
   Blogging.blogs = feed.getEntries();

   $("#blogs").empty();

   for(var i = 0; i < Blogging.blogs.length; i++){
        var entry = Blogging.blogs[i];
   //   append to dropdown
        var blogElm = $("<li>");
        var blogLink = $("<a>");
        blogLink.attr("href", "#blog"+i);
        blogLink.text(entry.getTitle().getText());
        
        blogElm.attr("data-blog-id", i.toString());
        blogElm.append(blogLink);

        $("#blogs").append(blogElm);
   //   Maybee append to some landingpage table
   //   load posts for the given blog
        loadPosts(i);
   }

    $("#blogs li").click(function(){
        showBlog($(this).attr("data-blog-id"));
    });
}

/**
 * Show blog with id of blogID
 */
function showBlog(blogID){
    Blogging.currentBlog = blogID;
    //Load blog with some callback stuff from dr google
    $("#container > div").hide();

    $("#postsbody").empty();

    //Fill blog list with posts
    var postsFeed = Blogging.blogFeeds[blogID];
    if(postsFeed.entry.length <= 0){
        handleError("Blog feed not yet loaded - or you have no posts");
        return;
    }
    for(var i = 0; i < postsFeed.entry.length; i++){
        //var postRow = none;
        var post = postsFeed.getEntries()[i];
        
        var postTitle = post.getTitle().getText();
        postTitle = postTitle != "" ? postTitle : "Untitled post";
        postTitle = post.getPublished() ? 
                              postTitle 
                            : postTilte+" (Draft)";
        var postPublished = post.getPublished().getValue().date;
        var postDateString = postPublished.getFullYear()+"-"
                +(postPublished.getMonth()+1)+"-"+postPublished.getDate()

        var postDisplay = blogging.templates.post_row({
            ID       : ""+i,
            Title    : postTitle,
            'Date'   : postDateString
        });

        var postRow = $(postDisplay);
        
        if(!post.getHtmlLink()){
            $("#Read"+i, postRow).text("DRAFT");
        }else{
            $("#Read"+i, postRow).click(function(){
                readPost($(this).attr("data-post-id"));
            });
        }
        $("#Edit"+i, postRow).click(function(){
            showPost($(this).attr("data-post-id"));
        });
        $("#Delete"+i, postRow).click(function(){
            deletePost($(this).attr("data-post-id"));
        });
        
        $("#postsbody").append(postRow);
    }
    $("#post-list").show();
}

function loadPosts(blogNum){
    var blog = Blogging.blogs[blogNum];
    if(!blog){ return; }

    var blogPostLink = blog.getEntryPostLink().getHref();
    Blogging.service.getBlogPostFeed(blogPostLink, 
        function (result){
            Blogging.blogFeeds[blogNum] = result.feed;
            if(blogNum == 0){ showBlog(blogNum); }
        }, 
        handleError);
}


/**
 * Show the post editor filled with content of the post with ID of postID
 */
function showPost(postID){
    //Load post based on currentBlog
    $("#container > div").hide();
    Blogging.currentPost = postID;

    var post = Blogging.blogFeeds[Blogging.currentBlog].getEntries()[postID];
    //post title
    $("#postTitle").val(post.getTitle().getText());
    //Tags [] - make magic
    var tmpTags = post.getCategories();
    var tags = "";
    for(tag in tmpTags)
        tags = ","+tag.getTerm();
    tags = tags.substring(1, tags.length);
    $("#postTags").val(tags);

    //Content
    $("#postBody").empty();
    Blogging.editorReference.html(post.getContent().getText());
    $("#post-edit").show();
}

/**
 * Redirect the client to the requested post
 */
function readPost(postId){
    postId = postId.substring("POST".length, postId.length);
    postId = postId.substring(0, postId.length-("read".length));
    var post = Blogging.blogFeeds[Blogging.currentShownBlog].blogFeed.getEntries()[postId];
    if(post.getHtmlLink() == undefined 
    || post.getHtmlLink() == 'undefined'){
        handleError("Oops this post is not published - so no viewing pleasure for you my friend");
        return;
    }
    var url = post.getHtmlLink().getHref();
    window.open(url, "_blank");
    return false;
}

/**
 * Save the current post to the google service
 */
function savePost(){

}

/**
 * Publish the current post to the google service
 */
function publishPost(){

}

/**
 * Logs in a user if she is not already logged in.
 * If the user is already logged in he/hes will be logged out
 */
function login(){
    var token = google.accounts.user.checkLogin(G.BLOGGER.AUTH_URL);
    if(token){ //User is logged in - logging out
        google.accounts.user.logout();
        init();
    }else{ google.accounts.user.login(G.BLOGGER.AUTH_URL); } //User logging in
}

/**
 * Initialize stuff that can be initialized more than once.
 */
function init(){
    $("#container > div").hide();
    $("#welcome-page").show();

    Blogging.service = new google.gdata.blogger.BloggerService("nwillemsDk-Blogging-01");
    if(google.accounts.user.checkLogin(G.BLOGGER.AUTH_URL)){
        //User is logged in
        $("#login").text("Log out");
        //Remeber to initialize other stuff
        loadBlogs();
    }else { /* User is not logged in - do not init very much */
        $("#login").text("Log in");
    }
}

$(document).ready(function(){
    //Login func
    $("#login").click(login);
    init();
    
    //Save func
    $("#postSave").click(savePost);
    //Publish func
    $("#postPublish").click(publishPost);

    //Dev feature
    
    
    $("#postsbody > tr > td:nth-child(3) > button:nth-child(1)").click(
        function(){
            alert("READ");
        }
    );
    $("#postsbody > tr > td:nth-child(3) > button:nth-child(2)").click(
        function(){
            alert("UPDATE");
        }
    );
    $("#postsbody > tr > td:nth-child(3) > button:nth-child(3)").click(
        function(){
            alert("DELETE");
        }
    );

    $("#postBody").wymeditor({
        iframeBasePath : 'wymeditor/iframe/blog/',
        skin : 'blogging',
        // Following buttons are there: Bold, italic, Link, Unlink,
        // InsertImage, OrderedList, UnOrderedList, table, undo, redo, html
        toolsItems: [
{'name':'Bold','title':'Strong','css':'wym_tools_strong'},
{'name':'Italic','title': 'Emphasis','css':'wym_tools_emphasis'},
{'name':'Superscript','title':'Superscript','css':'wym_tools_superscript'},
{'name':'Subscript','title':'Subscript','css':'wym_tools_subscript'},
{'name':'CreateLink','title':'Link','css':'wym_tools_link'},
{'name':'Unlink','title':'Unlink','css':'wym_tools_unlink'},
{'name':'InsertImage','title':'Image','css':'wym_tools_image'},
{'name':'InsertOrderedList','title':'Ordered_List','css':'wym_tools_ordered_list'},
{'name':'InsertUnorderedList','title':'Unordered_List','css':'wym_tools_unordered_list'},
{'name':'InsertTable','title':'Table','css':'wym_tools_table'},
{'name':'Undo','title': 'Undo','css':'wym_tools_undo'},
{'name':'Redo','title': 'Redo','css':'wym_tools_redo'},
{'name':'ToggleHtml','title':'HTML','css':'wym_tools_html'}
        ]
    });
    Blogging.editorReference = jQuery.wymeditors(0);
});


