var PageBuilder = (function () {
    
    function info (){
        const name = "PageBuilder.lib.user.js";
        const version = "0.4.2";
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
        console.log('prepare404Page called with title:', title);
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            console.log('DOM still loading, waiting...');
            document.addEventListener('DOMContentLoaded', () => {
                prepare404Page(title, headerText);
            });
            return;
        }
        
        // Check if page is 404 (less strict check)
        var keywordsMeta = document.querySelector('meta[name="keywords"]');
        var is404Page = false;
        
        if (keywordsMeta) {
            var keywordsContent = keywordsMeta.getAttribute('content');
            is404Page = keywordsContent && keywordsContent.includes("404");
        }
        
        // Also check if URL contains 'userscript' as a fallback
        if (!is404Page && window.location.href.includes('/userscript/')) {
            console.log('Detected userscript URL, treating as custom page');
            is404Page = true;
        }
        
        if (!is404Page) {
            console.warn('Not a 404 page, but continuing anyway for userscript pages');
        }

        // Change Website Title
        document.title = title;
    
        // Change Page header
        var pageHeader = document.getElementById('page-header');
        if (pageHeader) {
            var errorHeading = pageHeader.querySelector('h1.h2');
            if (errorHeading) {
                errorHeading.innerHTML = headerText;
            } else {
                console.warn('Error heading not found in page-header');
            }
        } else {
            console.warn('page-header element not found');
        }
    
        // Clear Page Content
        var pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = "";
            
            // Create custom-content div
            var customContent = document.createElement('div');
            customContent.className = 'custom-content';
            customContent.style.padding = '20px';
            pageContent.appendChild(customContent);
            
            console.log('Custom content div created successfully');
        } else {
            console.error('page-content element not found!');
        }
    }
    
    function addExtensionInstallationTable() {
        console.log('addExtensionInstallationTable called');
        
        // Make sure custom-content exists
        var pageContent = document.querySelector('.custom-content');
        if (!pageContent) {
            console.error('.custom-content element not found. Call prepare404Page first!');
            // Try to create it as fallback
            var pageContentDiv = document.getElementById('page-content');
            if (pageContentDiv) {
                pageContent = document.createElement('div');
                pageContent.className = 'custom-content';
                pageContent.style.padding = '20px';
                pageContentDiv.appendChild(pageContent);
                console.log('Created .custom-content as fallback');
            } else {
                console.error('Cannot create .custom-content - page-content not found');
                return;
            }
        }

        // Add loading indicator
        pageContent.innerHTML = '<p class="alert alert-info">Loading extensions...</p>';

        // Fetch the table from the given URL
        fetch('https://raw.githubusercontent.com/BBBaden-Moodle-userscripts/BBBaden-Moodle/main/AllProjects.md')
            .then(response => {
                console.log('Fetch response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                console.log('Fetched data length:', data.length);
                
                // Clear loading indicator
                pageContent.innerHTML = '';
                
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
                table.classList.add('table', 'table-striped');

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
                    const statusHeader = document.createElement('th');
                    statusHeader.textContent = 'Installed Status';
                    headerRow.appendChild(statusHeader);
                }

                // Process body rows
                const bodyRows = table.querySelectorAll('tbody tr');
                bodyRows.forEach(row => {
                    // Convert all "Install" links to buttons
                    const installCell = row.querySelector('td:last-child');
                    if (installCell) {
                        const installLink = installCell.querySelector('a');
                        if (installLink) {
                            const href = installLink.href;
                            installCell.innerHTML = '<a href="' + href + '"><button class="btn btn-outline-secondary btn-sm text-nowrap install-button">Install</button></a>';
                        }
                    }

                    // Add "Installed Status" column with default value "Not Installed"
                    const statusCell = document.createElement('td');
                    statusCell.className = 'status-cell';
                    statusCell.textContent = 'Not Installed';
                    row.appendChild(statusCell);
                });

                // Append the table to the div
                pageContent.appendChild(table);
                console.log('Table appended successfully');
            })
            .catch(error => {
                console.error('Error fetching or appending table:', error);
                pageContent.innerHTML = '<div class="alert alert-danger">Error loading extensions table: ' + error.message + '</div>';
            });
    }
    
    function updateInstallationStatus(scriptName, scriptVersion) {
        console.log('Updating installation status for:', scriptName, scriptVersion);
        
        // Find the table row with the matching script name
        var pageContent = document.querySelector('.custom-content');
        if (!pageContent) {
            console.error('.custom-content element not found');
            return;
        }
        
        var table = pageContent.querySelector('table');
        if (!table) {
            console.warn('Table not found yet');
            return;
        }
        
        var bodyRows = table.querySelectorAll('tbody tr');
        let found = false;
        
        bodyRows.forEach(row => {
            var nameCell = row.querySelector('td:nth-child(2)');
            if (!nameCell) return;
            
            var installedScriptName = nameCell.textContent.trim();
            
            // Try to match by name (case-insensitive and flexible)
            if (installedScriptName.toLowerCase().includes(scriptName.toLowerCase()) ||
                scriptName.toLowerCase().includes(installedScriptName.toLowerCase())) {
                
                // Update the status cell with "Installed"
                var statusCell = row.querySelector('.status-cell');
                if (statusCell) {
                    statusCell.textContent = 'Installed (v' + scriptVersion + ')';
                    statusCell.style.color = 'green';
                    statusCell.style.fontWeight = 'bold';
                    found = true;
                    console.log('Updated status for:', scriptName);
                }
            }
        });
        
        if (!found) {
            console.log('Script not found in table:', scriptName);
        }
    }
    
    return {
        info: info,
        prepare404Page: prepare404Page,
        addExtensionInstallationTable: addExtensionInstallationTable,
        updateInstallationStatus: updateInstallationStatus,
    };
})();
