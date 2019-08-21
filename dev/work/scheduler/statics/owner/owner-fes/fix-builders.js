const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dir = './test/builders/rpc'
let i = 0;
const files = fs.readdirSync(dir);
let properties = {}
const filesContent = {}
const builderHelper = {}
let isInAClass = false;
let foundPrivates = false;
let isInBuild = false;
let className = '';

function reset() {
  isInAClass = false;
  foundPrivates = false;
  isInBuild = false;
  properties = {}
  className = '';
  print('reset')
}

console.log('\n===> Making your ambassador builders better since 2019! <===\n')

files
  .filter(file => !file.match(/^ContactsServer/))
  // .filter(file => file.match(/^Book/))
  .forEach(file => {
      let newFileContent = '';
      const filePath = path.join(dir, file);
      let newLine = '';

      var lineReader = readline.createInterface({
        input: fs.createReadStream(filePath)
      });

      lineReader.on('close', function () {
        filesContent[filePath] = newFileContent;
        newFileContent = '';
      })

      lineReader.on('line', function (line) {
        newLine = line;
        let match;
        // match = line.match(/TransparencyDTOBuilder/)
        // if (!!match) {
        //   console.log('here')
        // }

        if (!isInAClass) {
          match = line.match(/class (\w*)/)
          if (!!match) {
            isInAClass = true;
            className = `a${'aeiou'.includes(match[1][0].toLowerCase())?'n':''}${match[1].replace('DTOBuilder','')}`;
            print('found class ' + className)
            if (!builderHelper[file]) {
              print('creating file ' + file)
              builderHelper[file] = {};
            }
            builderHelper[file][className] = { withs:[]};
          }
        }

        if (isInAClass) {
          match = line.match(/\s*private (\w*): (\w*)(\[\])? = (.*);/)
          if (!!match) {
            foundPrivates = true;
            const propertyName = match[1];
            const propertyType = match[2];
            const propertyBuilder = match[4];
            properties[propertyName] = propertyBuilder;
            print('found private ' + propertyName)
            newLine = line.replace(' = ', '').replace(propertyBuilder,'')
          }

          match = line.match(/with(\w*)\((\w*): (\w*)\[\]\)/)
          if (!!match) {
            if (!builderHelper[file]){
              builderHelper[file] = {[className] : { withs:[]}};
            }
            builderHelper[file][className].withs.push(`with${match[1]}`)
          }
        }

        // if (foundPrivates) {
          match = line.match(/build\(\):/)
          if (!!match) {
            isInBuild = true;
            print('in build')
          }
        // }

        if (isInBuild) {
          // console.log(properties)
          match = line.match(/(\s*)(\w*): this\.(\w*)/)
          if (!!match) {
            print(`found builder: ${line}`)
            const match = line.match(/(\s*)(\w*): this\.(\w*)/)
            const property = match[2]
            if (properties[property]) {
              newLine = `${match[1]}${property}: this.${property} === undefined ? ${properties[property]} : this.${property},`
            }
          }

          match = line.match(/}/)
          if (!!match) {
            reset()
          }
        }

        newFileContent += newLine + '\n'
        // console.log(newLine)
      });

      print(newFileContent)
  })

setTimeout(()=> {
  for (file in filesContent) {
      fs.writeFile(file, filesContent[file], 'utf8', function (err) {
            if (err) return print(err);
          });
  }

}, 1000)

const seen1 = {};
const seen2 = {};

  setTimeout(()=> {
    // console.log(builderHelper)
    let builderContent = '/* tslint:disable */\n'
    let filesNames = []
    for (file in builderHelper) {
      filesNames.push(file)
    }

    filesNames = filesNames.sort()

    for (let index in filesNames) {
      const file = filesNames[index]
      builderContent += 'import {\n'
      for (className in builderHelper[file]) {
        if (!seen1[className]) {
          builderContent += `   ${className} as amb${className},\n`
          seen1[className] = true;
        }
      }
      builderContent += `} from './builders/rpc/${file.replace('.ts','')}';\n`
    }

    for (index in filesNames) {
      const file = filesNames[index]
      for (className in builderHelper[file]) {
        if (!seen2[className]) {
          builderContent += `export function ${className}() {\n\treturn amb${className}()`
          // if (builderHelper[file][className].withs.length === 0) {
          //   builderContent += `;`
          // }
          // builderContent += `\n`
          for (wither in builderHelper[file][className].withs) {
              builderContent += `\n\t\t\t\t\t.${builderHelper[file][className].withs[wither]}([])`
          }
          builderContent += `;\n}\n`
          seen2[className] = true;
        }
      }
    }

  fs.writeFile('test/builders-helper.ts', builderContent, 'utf8', function (err) {
    console.log('\n\n Done! \n')
    if (err) return print(err);
  });

}, 1000)

  function print(text){
    // console.log(text)
  }
