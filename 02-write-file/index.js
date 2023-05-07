const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'test.txt');
let writeableStream = fs.createWriteStream(file);
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

process.stdout.write('Hello, enter something, please.\n');

rl.on('line', (input) => {
  if (input.toString().trim() === 'exit') {
    process.exit();
  }
  writeableStream.write(`${input}\n`);
});

rl.on('SIGINT', () => process.emit('SIGINT'));

process.on('SIGINT', () => process.exit());

process.on('exit', () => process.stdout.write('Bye-bye!\n'));
