const fs = require('fs')
const path = require('path')
const getFiles = require('./get-files')

const inputPath = process.argv[2] || './'
const outputFile = process.argv[3] || 'index.md'
const pagebreak = process.argv[4] || null

const run = async () => {
  const files = await getFiles(inputPath, 'md', { ignore: [outputFile, 'readme.md', 'readme-references.md'] })
  console.log('Merge files:')
  files.forEach(e => console.log(e))
  const contents = files.map(e => fs.readFileSync(path.join(inputPath, e)))
  const eof = (pagebreak ? ('\n\n' + pagebreak + '\n') : '') + '\n'
  const output = contents.join(eof) + '\n'
  fs.writeFileSync(outputFile, output)
  console.log(files.length + ' files merged to ' + outputFile)
}

run()
