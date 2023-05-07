const fs =  require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

async function makeBundleCss() {
  const srcDir = path.join(__dirname, 'styles');
  const desDir = path.join(__dirname, 'project-dist');
  const bundleCss = path.join(desDir, 'bundle.css');

  const dirContent = await fsPromises.readdir(srcDir, {withFileTypes:true});
  const cssFiles = dirContent.filter(file => file.isFile() && path.extname(file.name) === '.css');
  const writeableStream =  fs.createWriteStream(bundleCss);
  cssFiles.forEach((file)=> {
    const srcFile = path.join(srcDir, file.name);
    const readableStream = fs.createReadStream(srcFile);
    readableStream.on('data', chunk => writeableStream.write(chunk.toString()));
  });
}

makeBundleCss();