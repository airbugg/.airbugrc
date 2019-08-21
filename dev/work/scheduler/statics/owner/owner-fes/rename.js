// node rename src (\w*).spec.ts .tests.ts
// node rename test (\w*).e2e.ts .tests.ts
// back ->
// node rename src (\w*).tests.ts .spec.ts
// node rename test (\w*).tests.ts .e2e.ts
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);
const dir = args[0];
const match = RegExp(args[1], 'g');
const replace = args[2];
const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source => fs.readdirSync(source).map(name => path.join(source, name)).filter(isDirectory)

let i = 0;
updateDir(dir)
  function updateDir(dir) {
    const files = fs.readdirSync(dir);
    files
    .filter(file => file.match(match))
    .forEach(file => {
      const filePath = path.join(dir, file);
      const newFilePath = path.join(dir, file.replace(match, replace));

      // console.log(`renaming ${filePath} to ${newFilePath}`)
      console.log(`#${i++} renaming ${filePath}`)
      fs.renameSync(filePath, newFilePath);
    });

    allDirectories = getDirectories(dir).forEach((subdir) => updateDir(subdir))
  }
