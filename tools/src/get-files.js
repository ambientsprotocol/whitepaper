const fs = require('fs')

const getFiles = (dir, fileEnding, options) => new Promise((resolve, reject) => {
  // Default options
  options = Object.assign({}, { ignore: [] }, options)

  fs.readdir(dir, function(err, items) {
    if (err) {
      reject(err)
    }

    //console.log("All files:", items);
    const files = items
      .filter(e => e.split('.').pop().toLowerCase() === fileEnding)
      .filter(e => !options.ignore.includes(e.toLowerCase()))


    resolve(files)
  })
})

module.exports = getFiles
