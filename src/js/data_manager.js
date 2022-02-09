const Papa = require('papaparse')

const loadFile = (file_url, callback) => {
  return Papa.parse(file_url, {download: true, complete: callback})
}

export default {
  loadFile
}
