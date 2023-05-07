const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'text.txt');
const rr = fs.createReadStream(file);
rr.on('data', data => process.stdout.write(data.toString()));
