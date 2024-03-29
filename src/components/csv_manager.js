var Papa = require('papaparse')

class Sparccsv {
  constructor() {}

  loadFile(file_url) {
    return new Promise(resolve => {
      fetch(file_url)
        .then(response => response.text())
        .then(data => {
          this.csv_data = Papa.parse(data)
          resolve()
        })
    })
  }

  loadData(data) {
    return new Promise(resolve => {
      this.csv_data = {}
      this.csv_data.data = data
      resolve()
    })
  }

  transposeSelf() {
    var tempData = this.transpose(this.csv_data.data)
    this.csv_data.data = tempData
  }

  getDataType() {
    var first = this.getHeaders()[0]
    if (first.toLowerCase().includes('time')) {
      return 'scatter'
    } else if (first.toLowerCase().includes('name')) {
      return 'bar'
    }
    var first_col = this.getColoumnByIndex(0)
    if (Number(first_col[4]) > Number(first_col[3])) {
      return 'scatter'
    } else {
      return 'bar'
    }
  }

  getXaxis() {
    var firstHeader = this.csv_data.data[0][0]
    return firstHeader.split('-').join(' ').split('_').join(' ')
  }

  getTitle(url) {
    var title = url.split('/').pop() //grab file from url
    title = title.split('-').join(' ').split('_').join(' ').split('.')[0] //Process file name into title
    return title
  }

  // Return all headers
  getHeaders() {
    return this.csv_data.data[0]
  }

  // Returns all headers except for first cell
  getHeadersExceptForFirst() {
    var headers = this.csv_data.data[0]
    headers.shift()
    return headers
  }

  getCSVData() {
    return [...this.csv_data.data]
  }

  // Remove header and first row to pass data values only
  getDataValuesOnly() {
    let all_data = [...this.csv_data.data]
    let headers_removed = all_data.slice(1)
    let headers_and_col_removed = headers_removed.map(function (row) {
      return row.slice(1)
    })
    return headers_and_col_removed
  }

  getSampleRate() {
    return 1 / (this.csv_data.data[1][1] - this.csv_data.data[1][0])
  }

  getColoumnByIndex(index) {
    let col = this.csv_data.data.map(row => {
      return row[index]
    })
    col.shift()
    return col
  }

  getHeaderByIndex(index) {
    return this.csv_data.data[0][index]
  }

  getColoumnByName(column_name) {
    var column_index = 0
    for (let i in this.csv_data.data[0]) {
      if (this.csv_data.data[0][i] === column_name) {
        column_index = i
      }
    }
    if (column_index === 0) {
      return false // if coloumn not found
    }
    return this.getColoumnByIndex(column_index)
  }

  getByAxes(channelx, channely) {
    var dx = []
    var c1 = this.getColoumnByIndex(0)
    var index = []
    for (let i in channely) {
      for (let j in c1) {
        if (c1[j] === channely[i]) {
          index.push(j)
          continue
        }
      }
    }
    var datat = []
    for (let i in channelx) {
      var col = []
      dx = this.getColoumnByName(channelx[i])
      for (let j in index) {
        col.push(dx[index[j]])
      }
      datat.push(col)
    }
    return [...this.transpose(datat)]
  }

  export(selectedChannels) {
    var headerList = []
    var selectedData = []
    headerList.push(this.getHeaderByIndex(0))
    selectedData.push(this.getColoumnByIndex(0))
    for (let i in selectedChannels) {
      headerList.push(selectedChannels[i])
      selectedData.push(this.getColoumnByName(selectedChannels[i]))
    }
    var filename = 'sparc-export-' + Math.random().toString(36).slice(-5) + '.csv'
    this.downloadCSV({
      filename: filename,
      data: this.transpose(selectedData),
      columns: headerList
    })
  }

  transpose(array) {
    return array[0].map((col, i) => array.map(row => row[i]))
  }

  downloadCSV = args => {
    /* Use like so: 
     downloadCSV({ 
      filename: 'filename.csv',
      data: [{'a': '1', 'b': '2'}],
      columns: ['a','b']
      });
     */

    let filename = args.filename || 'export.csv'

    let csv = Papa.unparse(args.data)
    if (csv == null) return

    var blob = new Blob([csv])
    var a = window.document.createElement('a')
    a.href = window.URL.createObjectURL(blob, {type: 'text/plain'})
    a.download = filename
    document.body.appendChild(a)
    a.click() // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
    document.body.removeChild(a)
  }
}

module.exports = Sparccsv
