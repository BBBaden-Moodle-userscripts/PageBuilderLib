var PageBuilder = (function () {
    
    function info (){
        const name = "PageBuilder.lib.user.js";
        const version = "0.5.2";
        const description = "A Simple Page builder for moodle.bbbaden.ch";
        const author = "PianoNic";
        const homepageURL = "";

        return {
            name: name,
            version: version,
            description: description,
            author: author,
            homepageURL: homepageURL   
        };
    }

    // Setup Custom Functions
    Document.prototype.selectPageContent = function() {
        return document.getElementById('page-content');
    };

    Document.prototype.clearPageContent = function() {
        var pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = "";
        }
    };

    function prepare404Page(title, headerText){
        console.log('PageBuilder: Preparing page with title:', title);
        
        // Check for 404 page OR userscript pages
        var is404 = false;
        var keywordsMeta = document.querySelector('meta[name="keywords"]');
        
        if (keywordsMeta) {
            var keywordsContent = keywordsMeta.getAttribute('content');
            is404 = keywordsContent && keywordsContent.includes("404");
        }
        
        // Also allow userscript pages
        var isUserscriptPage = window.location.href.includes('/userscript/');
        
        if (!is404 && !isUserscriptPage) {
            console.error("This function should only be called on 404 or userscript pages!");
            return;
        }

        // Change Website Title
        document.title = title;
    
        // Change Page header
        var pageHeader = document.getElementById('page-header');
        if (pageHeader) {
            var errorHeading = pageHeader.querySelector('h1.h2');
            if (errorHeading) {
                errorHeading.innerHTML = headerText;
                console.log('PageBuilder: Header updated');
            }
        }
    
        // Clear Page Content
        var pageContent = document.getElementById('page-content');
        if (!pageContent) {
            console.error('PageBuilder: page-content element not found!');
            return;
        }
        
        pageContent.innerHTML = "";
        
        // CREATE THE CUSTOM-CONTENT DIV
        var customContent = document.createElement('div');
        customContent.className = 'custom-content';
        customContent.style.padding = '20px';
        pageContent.appendChild(customContent);
        console.log('PageBuilder: Page prepared with custom-content div');
    }
    
    return {
        info: info,
        prepare404Page: prepare404Page,
    };
})();
