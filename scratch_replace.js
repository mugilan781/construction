const fs = require('fs');
const path = require('path');

const publicDir = 'c:/MUGILAN/MR Coderz Hub/Project 2/Construction/public';
const files = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

files.forEach(file => {
   const filePath = path.join(publicDir, file);
   let content = fs.readFileSync(filePath, 'utf8');
   
   // Replace footer about
   content = content.replace(
      /<p>Delivering premium construction solutions with unmatched precision, quality, and innovation since 2005\.<\/p>/g,
      `<p class="dynamic-about">Delivering premium construction solutions with unmatched precision, quality, and innovation since 2005.</p>`
   );
   
   // Replace footer map marker / address
   content = content.replace(
      /<span>123 Builder's Avenue, Chennai,<br>Tamil Nadu 600001<\/span>/g,
      `<span class="dynamic-address">123 Builder's Avenue, Chennai,<br>Tamil Nadu 600001</span>`
   );
   
   // Replace footer phone
   content = content.replace(
      /<span>\+91 98765 43210<\/span>/g,
      `<span class="dynamic-phone">+91 98765 43210</span>`
   );
   
   // Replace footer email
   content = content.replace(
      /<span>info@infranest\.com<\/span>/g,
      `<span class="dynamic-email">info@infranest.com</span>`
   );
   
   // Specific to contact.html
   if (file === 'contact.html') {
       content = content.replace(
           /<p>123 Builder's Avenue, Anna Nagar,<br>Chennai, Tamil Nadu 600001<\/p>/g,
           `<p class="dynamic-address">123 Builder's Avenue, Anna Nagar,<br>Chennai, Tamil Nadu 600001</p>`
       );
       content = content.replace(
           /<p>\+91 98765 43210<br>\+91 44 2345 6789<\/p>/g,
           `<p class="dynamic-phone">+91 98765 43210</p>`
       );
       content = content.replace(
           /<p>info@infranest\.com<br>support@infranest\.com<\/p>/g,
           `<p class="dynamic-email">info@infranest.com</p>`
       );
       content = content.replace(
           /<p style=\"font-size:1\.5rem; font-weight:700; font-family:'Cormorant Garamond', serif; color:var\(--white\); letter-spacing: 0\.5px;\">\+91 98765 43210<\/p>/g,
           `<p class="dynamic-phone" style="font-size:1.5rem; font-weight:700; font-family:'Cormorant Garamond', serif; color:var(--white); letter-spacing: 0.5px;">+91 98765 43210</p>`
       );
   }

   fs.writeFileSync(filePath, content, 'utf8');
});
console.log('Done replacing tags!');
