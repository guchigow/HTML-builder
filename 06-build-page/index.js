const fs =  require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const readline = require('readline');

async function makeCopyDirectory(src, dist) {
  const srcDir = path.join(src);
  const desDir = path.join(dist);
  const options = {
    recursive: true,
    force: true
  };
  await fsPromises.rm(desDir, options, err => { if (err) throw err; });
  await fsPromises.mkdir(desDir, err => { if (err) throw err; });
  const dirContent = await fsPromises.readdir(srcDir, {withFileTypes:true});
  for (const file of dirContent) {
    const srcNest = path.join(src, file.name);
    const disNest = path.join(dist, file.name);
    file.isDirectory() ? makeCopyDirectory(srcNest, disNest) : fs.copyFile(srcNest, disNest, (err) => {
      if(err) throw err;
    });
  }
}

async function makeBundleCss(distname) {
  const srcDir = path.join(__dirname, 'styles');
  const desDir = path.join(distname);
  const bundleCss = path.join(desDir, 'style.css');
  const dirContent = await fsPromises.readdir(srcDir, {withFileTypes:true});
  const cssFiles = dirContent.filter(file => file.isFile() && path.extname(file.name) === '.css');
  const writeableStream =  fs.createWriteStream(bundleCss);
  cssFiles.forEach((file)=> {
    const srcFile = path.join(srcDir, file.name);
    const readableStream = fs.createReadStream(srcFile);
    readableStream.on('data', chunk => writeableStream.write(chunk.toString()));
  });
}

async function makeHtml(dist) {

  const components = path.join(__dirname, 'components');
  const html = path.join(dist, 'index.html');
  const template = path.join(__dirname, 'template.html');
  const templateRead = fs.createReadStream(template);
  const htmlWrite = fs.createWriteStream(html);

  const rl = readline.createInterface({
    input: templateRead,
    output: htmlWrite
  });

  let componentsArr = [];
  const dirContent = await fsPromises.readdir(components, {withFileTypes:true});

  dirContent.forEach((file)=> {
    const lastDotIndex = file.name.lastIndexOf('.');
    const name = file.name.slice(0, lastDotIndex);
    componentsArr.push(name);
  });

  rl.on('line', (input) => {
    const curLine = input.toString().trim().slice(2, -2);
    if (componentsArr.includes(curLine)) {
      const index = componentsArr.indexOf(curLine);
      const copmonent = fs.createReadStream( path.join(components, `${componentsArr[index]}.html`));
      copmonent.on('data', data =>  htmlWrite.write(`${data}\n`));
    } else {
      htmlWrite.write(`${input}\n`);
    }
  });
}

async function buildHtmlCss() {
  const assets = path.join(__dirname, 'assets');
  const dist = path.join(__dirname, 'project-dist');
  const options = {
    recursive: true,
    force: true
  };
  await fsPromises.rm(dist, options, err => { if (err) throw err; });
  await fsPromises.mkdir(dist, err => { if (err) throw err; });
  makeHtml(dist);
  makeBundleCss(dist);
  makeCopyDirectory(assets, path.join(dist, 'assets'));
}

buildHtmlCss();