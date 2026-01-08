var PageBuilder = (function () {
    
    function info (){
        const name = "PageBuilder.lib.user.js";
        const version = "0.4.1";
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
        // Checks if the page is a 404 error page
        var keywordsMeta = document.querySelector('meta[name="keywords"]');
        if(!keywordsMeta){
            console.error("Keywords meta tag not found!");
            return;
        }
        
        var keywordsContent = keywordsMeta.getAttribute('content');
        if(!keywordsContent.includes("404")){
            console.error(new Error("This function can only be called on the 404 page!"));
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
            }
        }
    
        // Clear Page Content
        document.clearPageContent();
        
        // Create custom-content div if it doesn't exist
        var pageContent = document.getElementById('page-content');
        if (pageContent && !document.querySelector('.custom-content')) {
            var customContent = document.createElement('div');
            customContent.className = 'custom-content';
            pageContent.appendChild(customContent);
        }
    }
    
    function addExtensionInstallationTable() {
        // Make sure custom-content exists
        var pageContent = document.querySelector('.custom-content');
        if (!pageContent) {
            console.error('.custom-content element not found. Call prepare404Page first!');
            return;
        }

        // Fetch the table from the given URL
        fetch('https://raw.githubusercontent.com/BBBaden-Moodle-userscripts/BBBaden-Moodle/main/AllProjects.md')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                // Parse the markdown content into HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                // Extract the table
                const table = doc.querySelector('table');
                if (!table) {
                    throw new Error('Table not found in fetched content');
                }

                // Set styles to make the table use the full width
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';

                // Add space between each line (transparent border)
                const tbody = table.querySelector('tbody');
                if (tbody) {
                    const tableRows = tbody.querySelectorAll('tr');
                    tableRows.forEach(row => {
                        row.style.borderBottom = '4px solid transparent';
                    });
                }

                // Add new columns at the end of each row
                const headerRow = table.querySelector('thead tr');
                if (headerRow) {
                    headerRow.innerHTML += '<th>Installed Status</th>';
                }

                const bodyRows = table.querySelectorAll('tbody tr');
                bodyRows.forEach(row => {
                    // Convert all "Install" links to buttons
                    const installCell = row.querySelector('td:last-child');
                    if (installCell) {
                        const installLink = installCell.querySelector('a');
                        if (installLink) {
                            installLink.outerHTML = '<a href="' + installLink.href + '"><button class="btn btn-outline-secondary btn-sm text-nowrap h2 install-button">Install</button></a>';
                        }
                    }

                    // Add "Installed Status" column with default value "Not Installed"
                    row.innerHTML += '<td class="status-cell">Not Installed</td>';
                });

                // Append the table to the div
                pageContent.appendChild(table);
            })
            .catch(error => {
                console.error('Error fetching or appending table:', error);
                pageContent.innerHTML = '<p class="alert alert-danger">Error loading extensions table: ' + error.message + '</p>';
            });
    }
    
    function updateInstallationStatus(scriptName, scriptVersion) {
        // Find the table row with the matching script name
        var pageContent = document.querySelector('.custom-content');
        if (!pageContent) {
            console.error('.custom-content element not found');
            return;
        }
        
        var table = pageContent.querySelector('table');
        
        if (table) {
            var bodyRows = table.querySelectorAll('tbody tr');
            
            bodyRows.forEach(row => {
                var nameCell = row.querySelector('td:nth-child(2)');
                if (!nameCell) return;
                
                var installedScriptName = nameCell.textContent.trim();
                
                if (installedScriptName === scriptName) {
                    // Update the status cell with "Installed"
                    var statusCell = row.querySelector('.status-cell');
                    if (statusCell) {
                        statusCell.textContent = 'Installed (v' + scriptVersion + ')';
                        statusCell.style.color = 'green';
                        statusCell.style.fontWeight = 'bold';
                    }
                }
            });
        }
    }
    
    return {
        info: info,
        prepare404Page: prepare404Page,
        addExtensionInstallationTable: addExtensionInstallationTable,
        updateInstallationStatus: updateInstallationStatus,
    };
})();
