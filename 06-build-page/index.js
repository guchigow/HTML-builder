const fs =  require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

async function copyDirectory(src, dist) {
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
    file.isDirectory() ? copyDirectory(srcNest, disNest) : fs.copyFile(srcNest, disNest, (err) => {
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
  const templatePath = path.join(__dirname, 'template.html');
  const html = path.join(dist, 'index.html');

  let template = await fsPromises.readFile(templatePath, 'utf8');
  const dirContent = await fsPromises.readdir(components, {withFileTypes:true});

  let arrTags = [];
  dirContent.forEach((file)=> {
    const lastDotIndex = file.name.lastIndexOf('.');
    const name = file.name.slice(0, lastDotIndex);
    arrTags.push(name);
  });

  for (const item of arrTags) {
    const copmonent = await fsPromises.readFile( path.join(components, `${item}.html`));
    template = template.replace(`{{${item}}}`, copmonent);
  }

  await fsPromises.writeFile(html, template );
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
  copyDirectory(assets, path.join(dist, 'assets'));
}

buildHtmlCss();