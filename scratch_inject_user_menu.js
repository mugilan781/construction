const fs = require('fs');
const path = require('path');

const userMenuHtml = `
      <div class="user-menu">
        <div class="user-icon" onclick="toggleUserMenu()"><i class="fas fa-user"></i></div>
        <div class="user-dropdown" id="userDropdown">
          <!-- Populated by updateUserMenu() in main.js -->
        </div>
      </div>`;

function injectUserMenuToDir(dirPath) {
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.html'));
    for (const file of files) {
        const fp = path.join(dirPath, file);
        let content = fs.readFileSync(fp, 'utf8');
        
        // Find the nav-right div and insert the user menu before its closing tag
        // We know it looks like <div class="nav-right"> ... </div>
        // Or we can just find the Get a Quote button and insert after it.
        
        if (content.includes('class="nav-right"') && !content.includes('class="user-menu"')) {
            // Regex to find the nav-right container and its contents
            // It usually contains the "Get a Quote" link.
            const navRightRegex = /(<div class="nav-right">[\s\S]*?)([\s]*<\/div>)/;
            
            let newContent = content.replace(navRightRegex, (match, p1, p2) => {
                return p1 + userMenuHtml + p2;
            });

            if (content !== newContent) {
                fs.writeFileSync(fp, newContent);
                console.log(`Injected user menu into ${file}`);
            }
        }
    }
}

injectUserMenuToDir('public');
