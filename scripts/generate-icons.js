const fs = require('fs');
const path = require('path');

const icon16 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAcSURBVDhPY3wPBP4HwwYwGkHVAEYjqBrAaARVAxgxMh10w3QoGvwAAAABJRU5ErkJggg==";
const icon48 = "iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAiSURBVGhD7cExAQAAAMIg+6deCj9gAAAAAAAAAAAAAADg1wAOwAAB8cQ5IQAAAABJRU5ErkJggg==";
const icon128 = "iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAABCSURBVHhe7cExAQAAAMIg+6deCU9gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+GtAAcAAQc9yOAAAAAElFTkSuQmCC";

const dir = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(dir, { recursive: true });

fs.writeFileSync(path.join(dir, 'icon16.png'), Buffer.from(icon16, 'base64'));
fs.writeFileSync(path.join(dir, 'icon48.png'), Buffer.from(icon48, 'base64'));
fs.writeFileSync(path.join(dir, 'icon128.png'), Buffer.from(icon128, 'base64'));

console.log("Helyettesítő ikonok legenerálva a public/icons mappába.");
