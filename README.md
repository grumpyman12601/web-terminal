# Web Terminal

[![Github All Releases](https://img.shields.io/github/downloads/grumpyman12601/web-terminal/total
)]()

A terminal to navigate your website's file structure. Created for Fundamentals of Web Programming @ Kirkwood in 2025. To see it in use go [HERE](https://grumpyman12601.github.io/html_css_5/index.html)

NOTE: This is basically a scrape of your own site, so keep in mind that anything and everything you host on your website will be easily available to anyone.

#
## What you need
- Javascript knowledege
- Your website.
- [NodeJS](https://nodejs.org)

# Installation
Download, copy, or integrate [term.html](term.html), [term_style.css](term_style.css), and [term.js](term.js) into your website.

The terminal should work, but the LS command won't return anything, this is because we haven't generated the filesystem object yet.

## To generate your website's file structure:
1. Download generateFS.js and copy it to a new folder.
2. Download your entire website. Copy the site folder, and paste it into the new folder you created.
3. Rename your website folder to "public". When you're done it should look like this:

       📁 your-new-folder/

       ├── generateFS.js

       └── 📁 public
   
              └── index.html
              └── styles.css
    
6. Run generateFS.js using the command:

   ```node generateFS.js ```
9. Copy the contents of "filesystem.json" generated in the "public" folder
10. Paste these contents into the ```const filesystem = {} ``` constant in term.js on your website.

NOTE: If you have a big website, the structure will be very large. Terminal v3 will fix this by using a json file instead of a constant.

## Issues
Security

## Testing and patching
V3 will have a seperate json file, and will also hopefully improve the go command to allow for different files to be opened.

-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
