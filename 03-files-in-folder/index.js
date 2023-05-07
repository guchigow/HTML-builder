const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, 'secret-folder');
fs.readdir(dir, {withFileTypes:true}, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    fs.stat(path.join(dir, file.name), (err, stats) => {
      if (err) throw err;
      if(stats.isFile()) {
        const lastDotIndex = file.name.lastIndexOf('.');
        const name = file.name.slice(0, lastDotIndex);
        const ext = path.extname(file.name).slice(1);
        const size = stats.size;
        process.stdout.write(`${name}\t-  ${ext}\t-  ${size}\n`);
      }
    });
  });
});
