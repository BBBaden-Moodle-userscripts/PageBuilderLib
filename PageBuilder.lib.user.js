var PageBuilder = (function () {
    
    function info (){
        const name = "PageBuilder.lib.user.js";
        const version = "0.5.1";
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
        console.log('prepare404Page: Starting with title:', title);
        
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
        console.log('prepare404Page: Title changed to:', title);
    
        // Change Page header
        var pageHeader = document.getElementById('page-header');
        if (pageHeader) {
            var errorHeading = pageHeader.querySelector('h1.h2');
            if (errorHeading) {
                errorHeading.innerHTML = headerText;
                console.log('prepare404Page: Header updated to:', headerText);
            }
        }
    
        // Clear Page Content
        var pageContent = document.getElementById('page-content');
        if (!pageContent) {
            console.error('prepare404Page: page-content element not found!');
            return;
        }
        
        pageContent.innerHTML = "";
        console.log('prepare404Page: Page content cleared');
        
        // CREATE THE CUSTOM-CONTENT DIV!
        var customContent = document.createElement('div');
        customContent.className = 'custom-content';
        customContent.style.padding = '20px';
        pageContent.appendChild(customContent);
        console.log('prepare404Page: custom-content div created and appended');
    }
    
    function addExtensionInstallationTable() {
        console.log('addExtensionInstallationTable: Starting...');
        
        // Get custom-content element
        var pageContent = document.getElementsByClassName('custom-content')[0];
        
        if (!pageContent) {
            console.error('addExtensionInstallationTable: .custom-content not found! Did you call prepare404Page first?');
            return;
        }
        
        console.log('addExtensionInstallationTable: custom-content found, adding loading message...');
        pageContent.innerHTML = '<div class="alert alert-info">Loading extensions...</div>';

        // Fetch the table from the given URL
        fetch('https://raw.githubusercontent.com/BBBaden-Moodle-userscripts/BBBaden-Moodle/main/AllProjects.md')
            .then(response => {
                console.log('addExtensionInstallationTable: Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.text();
            })
            .then(data => {
                console.log('addExtensionInstallationTable: Data fetched, length:', data.length);
                
                // Re-get pageContent in case anything changed
                var pageContent = document.getElementsByClassName('custom-content')[0];
                if (!pageContent) {
                    throw new Error('.custom-content disappeared!');
                }
                
                // Clear loading message
                pageContent.innerHTML = '';
                
                // Parse the markdown content into HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(data, 'text/html');

                // Extract the table
                const table = doc.querySelector('table');
                if (!table) {
                    throw new Error('Table not found in markdown');
                }

                // Set styles to make the table use the full width
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                table.classList.add('table', 'table-striped', 'table-bordered');

                // Add space between each line (transparent border)
                const tbody = table.querySelector('tbody');
                if (tbody) {
                    const tableRows = tbody.querySelectorAll('tr');
                    tableRows.forEach(row => {
                        row.style.borderBottom = '4px solid transparent';
                    });
                }

                // Add new column header
                const headerRow = table.querySelector('thead tr');
                if (headerRow) {
                    const th = document.createElement('th');
                    th.textContent = 'Status';
                    headerRow.appendChild(th);
                }

                // Process body rows
                const bodyRows = table.querySelectorAll('tbody tr');
                bodyRows.forEach(row => {
                    // Convert all "Install" links to buttons
                    const lastCell = row.querySelector('td:last-child');
                    if (lastCell) {
                        const installLink = lastCell.querySelector('a');
                        if (installLink) {
                            const href = installLink.href;
                            lastCell.innerHTML = '<a href="' + href + '" target="_blank"><button class="btn btn-outline-primary btn-sm text-nowrap install-button">Install</button></a>';
                        }
                    }

                    // Add "Status" column with default value
                    const statusCell = document.createElement('td');
                    statusCell.className = 'status-cell text-center';
                    statusCell.innerHTML = '<span class="badge badge-secondary">Not Installed</span>';
                    row.appendChild(statusCell);
                });

                // Append the table to the div
                pageContent.appendChild(table);
                console.log('addExtensionInstallationTable: Table added successfully!');
            })
            .catch(error => {
                console.error('addExtensionInstallationTable: Error:', error);
                var pageContent = document.getElementsByClassName('custom-content')[0];
                if (pageContent) {
                    pageContent.innerHTML = '<div class="alert alert-danger"><strong>Error:</strong> ' + error.message + '</div>';
                }
            });
    }
    
    function updateInstallationStatus(scriptName, scriptVersion) {
        console.log('updateInstallationStatus: Updating', scriptName, 'v' + scriptVersion);
        
        // Find the table
        var table = document.querySelector('.custom-content table');
        if (!table) {
            console.warn('updateInstallationStatus: Table not found yet');
            return;
        }
        
        var bodyRows = table.querySelectorAll('tbody tr');
        let found = false;
        
        bodyRows.forEach(row => {
            var nameCell = row.querySelector('td:nth-child(2)');
            if (!nameCell) return;
            
            var tableName = nameCell.textContent.trim();
            
            // Flexible matching
            if (tableName.toLowerCase() === scriptName.toLowerCase() ||
                tableName.toLowerCase().replace(/\s+/g, '') === scriptName.toLowerCase().replace(/\s+/g, '') ||
                scriptName.toLowerCase().includes(tableName.toLowerCase()) ||
                tableName.toLowerCase().includes(scriptName.toLowerCase())) {
                
                var statusCell = row.querySelector('.status-cell');
                if (statusCell) {
                    statusCell.innerHTML = '<span class="badge badge-success">✓ Installed (v' + scriptVersion + ')</span>';
                    found = true;
                    console.log('updateInstallationStatus: Updated', tableName);
                }
            }
        });
        
        if (!found) {
            console.log('updateInstallationStatus: Script not found in table:', scriptName);
        }
    }
    
    return {
        info: info,
        prepare404Page: prepare404Page,
        addExtensionInstallationTable: addExtensionInstallationTable,
        updateInstallationStatus: updateInstallationStatus,
    };
})();
