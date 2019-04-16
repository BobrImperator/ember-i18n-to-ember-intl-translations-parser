/* eslint-disable */
const { StringDecoder } = require('string_decoder');
const fs = require('fs');

const root = "./";
const localesPath = `${root}/app/locales`;

const readDirectoryNames = (path) => fs.readdirSync(path);
const localeNames = readDirectoryNames(localesPath);

// file schema
// translations/module/file/en-us.json

const processStatus = fs.createWriteStream("Status.txt")
const addQuotesToKeys = (string) => string.replace(/(\s*?{\s*?|\s*?,\s*?)([‘“])?([a-zA-Z0-9]+)([‘“])?:/g, '$1"$3":')
const toCamelCase = (string) => string.replace(/-([a-z])/g, (g) => g[1].toUpperCase())

localeNames.forEach((locale) => {
  readDirectoryNames(`${localesPath}/${locale}`).filter((dir) => dir !== "translations.js").forEach((module) => {
    const fileNames = readDirectoryNames(`${localesPath}/${locale}/${module}`)
    const modulePath = `translations/${module}`;
    !fs.existsSync(modulePath) && fs.mkdirSync(modulePath);
    fileNames.forEach((file) => {
      const filePath = `${localesPath}/${locale}/${module}/${file}`;
      const fileNameToModule = file.replace(".js", "");
      
      if (fileNameToModule === "index") {
        return;
      }

      !fs.existsSync(`${modulePath}/${fileNameToModule}`) && fs.mkdirSync(`${modulePath}/${fileNameToModule}`)

      const data = new StringDecoder().end(fs.readFileSync(filePath));
      const cut = data.replace(/export default /g, "").replace(/;/g, "");
      let dataObject;
      try {
        dataObject = JSON.parse(addQuotesToKeys(cut));
      } catch(error) {
        processStatus.write(`\n There was an error with ${filePath}, and it couldn't be parsed ${error}`)
      }

      const obj = {
        [module]: {
          [toCamelCase(fileNameToModule)]: dataObject
        }
      }
      fs.writeFileSync(`${modulePath}/${fileNameToModule}/${locale}-us.json`, JSON.stringify(obj, null, 4))
    })
  })
})

processStatus.end();