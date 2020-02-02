var Papa = require('papaparse')

function Sparccsv() {

  var _this = this
  _this.csv_data = undefined

  this.loadFile = function (file_url) {
    return new Promise(function(resolve){
      fetch(file_url).then(response => response.text())
        .then( data => {
          _this.csv_data = Papa.parse(data)
          resolve() 
        })
      })
  }

  this.transposeSelf = function () {
    var tempData = transpose(_this.csv_data.data)
    _this.csv_data.data = tempData
  }

  this.getDataType = function () {
    var first = _this.getHeaders()[0]
    if (first.toLowerCase().includes('time')) {
      return 'scatter'
    } else if (first.toLowerCase().includes('name')) {
      return 'bar'
    }    
    var first_col = _this.getColoumnByIndex(0)
    if (Number(first_col[4]) > Number(first_col[3])){
      return 'scatter'
    } else {
      return 'bar'
    }
  }

  this.getXaxis = function(){
    var firstHeader = _this.csv_data.data[0][0]
    return firstHeader.split('-').join(' ').split('_').join(' ')
  }

  this.getTitle = function(url){
    var title = url.split('/').pop() //grab file from url
    title = title.split('-').join(' ').split('_').join(' ').split('.')[0] //Process file name into title
    return title
  }

  this.getHeaders = function () {
    return _this.csv_data.data[0]
  }

  this.getAllData = function () {
    return _this.csv_data.data
  }

  this.getSampleRate = function () {
    return 1 / (_this.csv_data.data[1][1] - _this.csv_data.data[1][0])
  }

  this.getColoumnByIndex = function (index) {
     let col = _this.csv_data.data.map((row) => { return row[index] })
     col.shift()
     return col
  }

  this.getHeaderByIndex = function (index) {
    return _this.csv_data.data[0][index]
  }

  this.getColoumnByName = function (column_name) {
    var column_index = 0
    for (let i in _this.csv_data.data[0]) {
      if (_this.csv_data.data[0][i] === column_name) {
        column_index = i
      }
    }
    if (column_index === 0){
      return false // if coloumn not found
    }
    return this.getColoumnByIndex(column_index)
  }

  this.export = function(selectedChannels){
    var headerList = []
    var selectedData = []
    headerList.push(_this.getHeaderByIndex(0))
    selectedData.push(_this.getColoumnByIndex(0))
    for (let i in selectedChannels){
      headerList.push(selectedChannels[i])
      selectedData.push(_this.getColoumnByName(selectedChannels[i]))
    }
    var filename = 'sparc-export-' + Math.random().toString(36).slice(-5)  + '.csv'
    downloadCSV({
      filename: filename,
      data: transpose(selectedData),
      columns: headerList
    })
  }

  this.exportForOpenCOR = function(state){
    var headerList = []
    var data 
    var selectedData = []
    headerList.push(_this.getHeaderByIndex(0))
    selectedData.push(_this.getColoumnByIndex(0))
    for (let i in state.selectedChannels){
      headerList.push(state.selectedChannels[i])
      selectedData.push(_this.getColoumnByName(state.selectedChannels[i]))
    }
    data = transpose(selectedData)
    data[0] = convertHeadersToOpencor(data[0])
    var filename = 'sparc-export-' + Math.random().toString(36).slice(-5)  + '.csv'
    downloadCSV({
      filename: filename,
      data: data,
      columns: headerList
    })
  }

  var transpose = function(array){
    return array[0].map((col, i) => array.map(row => row[i]));
  }

  var convertHeadersToOpencor = function(csvHeaders){
    var headers = [...csvHeaders]
    if (headers[0].toLowerCase().includes('seconds')) {
      headers[0] = 'environment | time (second)'
    } else if (!headers[0].toLowerCase().includes('minute')) {
      headers[0] = 'environment | time (minute)'
    } else if (!headers[0].toLowerCase().includes('ms')) {
      headers[0] = 'environment | time (millisecond)'
    } else if (!headers[0].toLowerCase().includes('millisecond')) {
      headers[0] = 'environment | time (millisecond)'
    } else {
      headers[0] = 'environment | time (unknown unit)'
    }

    for (let i in headers){
      if (i === 0){
        continue
      } 
      if (headers[i].toLowerCase().includes('mv') || headers[i].toLowerCase().includes('millivolts') ){
        headers[i].replace('mv','')
        headers[i].replace('millivolts','')
        headers[i].replace('(','')
        headers[i].replace(')','')
        headers[i] += ' | V (millivolt)'
      }
      else if (headers[i].toLowerCase().includes(' v') || headers[i].toLowerCase().includes('volts')){
        headers[i].replace('mv','')
        headers[i].replace('volts','')
        headers[i].replace('(','')
        headers[i].replace(')','')
        headers[i] += ' | V (volt)'
      }
      else if (headers[i].toLowerCase().includes('(')){
        var unit = '(' + headers[i].split('(')[1].split(')')[0] + ')' 
        headers[i] = headers[i].split('(')[0] + ' | ' + unit[0].toUpperCase() + ' ' + unit 
      } else {
        headers[i] += ' | x (Unknown Unit)'
      }
    }
    return headers
  }

  var downloadCSV = (args) => {  

    /* Use like so: 
     downloadCSV({ 
      filename: 'filename.csv',
      data: [{'a': '1', 'b': '2'}],
      columns: ['a','b']
      });
     */

    let filename = args.filename || 'export.csv';

    let csv = Papa.unparse(args.data)
    if (csv == null) return;

    var blob = new Blob([csv]);
    if (window.navigator.msSaveOrOpenBlob)  // IE hack; see http://msdn.microsoft.com/en-us/library/ie/hh779016.aspx
        window.navigator.msSaveBlob(blob, args.filename);
    else
    {
        var a = window.document.createElement("a");
        a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
        a.download = filename;
        document.body.appendChild(a);
        a.click();  // IE: "Access is denied"; see: https://connect.microsoft.com/IE/feedback/details/797361/ie-10-treats-blob-url-as-cross-origin-and-denies-access
        document.body.removeChild(a);
    }

  }
}





module.exports = Sparccsv