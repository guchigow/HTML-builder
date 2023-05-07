const fs = require('fs/promises');
const path = require('path');
const srcDir = path.join(__dirname, 'files');
const desDir = path.join(__dirname, 'files-copy');

async function makeCopyDirectory() {

  const options = {
    recursive: true,
    force: true
  };

  await fs.rm(desDir, options, err => { if (err) throw err; });

  await fs.mkdir(desDir, err => { if (err) throw err; });

  const dirContent = await fs.readdir(srcDir, {withFileTypes:true});

  const files = dirContent.filter(file => file.isFile());
  files.forEach((file)=> {
    const srcFile = path.join(srcDir, file.name);
    const destFile = path.join(desDir, file.name);
    fs.copyFile(srcFile, destFile);
  });
}

makeCopyDirectory();

