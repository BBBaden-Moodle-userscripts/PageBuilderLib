var PageBuilder = (function () {
    
    function info (){
        const name = "PageBuilder.lib.user.js";
        const version = "0.5.0";
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

    function ensureCustomContentExists() {
        // Check if .custom-content already exists
        var customContent = document.querySelector('.custom-content');
        if (customContent) {
            console.log('.custom-content already exists');
            return customContent;
        }
        
        // Get page-content
        var pageContent = document.getElementById('page-content');
        if (!pageContent) {
            console.error('page-content element not found!');
            return null;
        }
        
        // Create .custom-content div
        customContent = document.createElement('div');
        customContent.className = 'custom-content';
        customContent.style.padding = '20px';
        pageContent.appendChild(customContent);
        
        console.log('.custom-content created successfully');
        return customContent;
    }

    function prepare404Page(title, headerText){
        console.log('prepare404Page called with title:', title);
        
        // Change Website Title
        document.title = title;
    
        // Change Page header
        var pageHeader = document.getElementById('page-header');
        if (pageHeader) {
            var errorHeading = pageHeader.querySelector('h1.h2');
            if (errorHeading) {
                errorHeading.innerHTML = headerText;
                console.log('Page header updated');
            } else {
                console.warn('Error heading not found in page-header');
            }
        } else {
            console.warn('page-header element not found');
        }
    
        // Clear and setup Page Content
        var pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = "";
            console.log('page-content cleared');
        } else {
            console.error('page-content element not found!');
            return;
        }
        
        // Create custom-content div
        var customContent = ensureCustomContentExists();
        if (customContent) {
            console.log('Page prepared successfully');
        } else {
            console.error('Failed to create custom-content');
        }
    }
    
    function addExtensionInstallationTable() {
        console.log('addExtensionInstallationTable called');
        
        // Ensure .custom-content exists
        var pageContent = ensureCustomContentExists();
        
        if (!pageContent) {
            console.error('Cannot add table - custom-content could not be created');
            return;
        }

        // Add loading indicator
        pageContent.innerHTML = '<div class="alert alert-info">Loading extensions...</div>';
        console.log('Loading indicator added');

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
                
                // Re-get pageContent in case it was modified
                var customContent = document.querySelector('.custom-content');
                if (!customContent) {
                    throw new Error('.custom-content disappeared!');
                }
                
                // Clear loading indicator
                customContent.innerHTML = '';
                
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
                    const statusHeader = document.createElement('th');
                    statusHeader.textContent = 'Status';
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
                            installCell.innerHTML = '<a href="' + href + '" target="_blank"><button class="btn btn-outline-primary btn-sm text-nowrap install-button">Install</button></a>';
                        }
                    }

                    // Add "Status" column with default value
                    const statusCell = document.createElement('td');
                    statusCell.className = 'status-cell text-center';
                    statusCell.innerHTML = '<span class="badge badge-secondary">Not Installed</span>';
                    row.appendChild(statusCell);
                });

                // Append the table to the div
                customContent.appendChild(table);
                console.log('Table appended successfully');
            })
            .catch(error => {
                console.error('Error fetching or appending table:', error);
                var customContent = document.querySelector('.custom-content');
                if (customContent) {
                    customContent.innerHTML = '<div class="alert alert-danger"><strong>Error:</strong> ' + error.message + '</div>';
                }
            });
    }
    
    function updateInstallationStatus(scriptName, scriptVersion) {
        console.log('Updating installation status for:', scriptName, 'v' + scriptVersion);
        
        // Find the table
        var table = document.querySelector('.custom-content table');
        if (!table) {
            console.warn('Table not found yet, will retry...');
            setTimeout(() => updateInstallationStatus(scriptName, scriptVersion), 500);
            return;
        }
        
        var bodyRows = table.querySelectorAll('tbody tr');
        let found = false;
        
        bodyRows.forEach(row => {
            var nameCell = row.querySelector('td:nth-child(2)');
            if (!nameCell) return;
            
            var tableName = nameCell.textContent.trim();
            
            // Try to match by name (flexible matching)
            if (tableName.toLowerCase() === scriptName.toLowerCase() ||
                tableName.toLowerCase().replace(/\s+/g, '') === scriptName.toLowerCase().replace(/\s+/g, '') ||
                scriptName.toLowerCase().includes(tableName.toLowerCase()) ||
                tableName.toLowerCase().includes(scriptName.toLowerCase())) {
                
                // Update the status cell
                var statusCell = row.querySelector('.status-cell');
                if (statusCell) {
                    statusCell.innerHTML = '<span class="badge badge-success">✓ Installed (v' + scriptVersion + ')</span>';
                    found = true;
                    console.log('✓ Updated status for:', tableName);
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
        ensureCustomContentExists: ensureCustomContentExists,
    };
})();
