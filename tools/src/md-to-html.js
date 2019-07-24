const fs = require('fs')
const showdown = require('showdown')
const git = require('git-rev-sync')

const replaceAll = (s, search, replacement) => s.split(search).join(replacement)

const inputFile = process.argv[2] || 'index.md'
const outputFile = process.argv[3] || 'index.html'

const converter = new showdown.Converter({
  simplifiedAutoLink: true,
  ghCompatibleHeaderId: true,
  customizedHeaderId: true
})
const md = fs.readFileSync(inputFile).toString()
const html = converter.makeHtml(md)
const version = new Date().toISOString().slice(0,10) + '-' + git.short()
console.log('Replacing {{version}} with ' + version)

const replace = [
  ['{{VERSION}}', version]
]

const cleanedHtml = replace.reduce((text, e) => replaceAll(text, e[0], e[1]), html)

const header = fs.readFileSync('./src/html/header.html').toString()
const footer = fs.readFileSync('./src/html/footer.html').toString()
const output = header + '\n' + cleanedHtml + '\n' + footer
fs.writeFileSync(outputFile, output)
console.log(inputFile + ' converted to ' + outputFile)
