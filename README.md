# plotvuer

[![npm version](https://badge.fury.io/js/%40abi-software%2Fplotvuer.svg)](https://badge.fury.io/js/%40abi-software%2Fplotvuer)
[![Maintainability](https://api.codeclimate.com/v1/badges/8dd727f153711aaae6e1/maintainability)](https://codeclimate.com/github/Tehsurfer/plotvuer/maintainability)

This project is now in Vue 3 only.

If using vue 2, use the [Vue-2 branch](https://github.com/ABI-Software/plotvuer/tree/Vue-2)

This project aims to process and display csv files as graphs in the vue framework

Demo the site functionality of this app [here](https://plotvuer-demo.herokuapp.com/)*.

*_Demo will take 30s to load while Heroku server boots_

![demo](https://user-images.githubusercontent.com/37255664/73617045-a3231e00-467f-11ea-90bd-b1074acd26b3.gif)

**Don't feel like coding? See how to copy and paste plotvuer as an HTML widget [here](https://github.com/ABI-Software/plotvuer/blob/master/README.md#copy-and-paste-as-an-html-widget)**

## Project installation
```
npm i @abi-software/plotvuer
```


## Project setup
```
npm install
npm run serve
```

### Compiles and minifies for production
```
npm run build-bundle
```

## How to use
Include the package in your script.
```javascript
import { PlotVuer } from '@abi-software/plotvuer'
import '@abi-software/plotvuer/dist/plotvuer.css'
```
Local registration in vue component:
```javascript
export default {
  ...
  components: {
    PlotVuer,
  }
  ...
}
```

The snippet above registers the Plotvuer component into the global scope.
You can now use the Plotvuer in your vue template as followed:

```html
<PlotVuer :data-source="data" :metadata="metadata" :supplemental-data="supplementalData"></PlotVuer>
```

`datasource` has two options for loading data into plotvuer:

##### Using plotly directly

```javascript
let data = {
  data: [
    {
      x: [0, 1, 2, 3, 4, 5],
      y: [100, 10, 130, 70, 80, 90],
      type: 'scatter'
    }
  ],
  layout: { // **Optional**
    height: '700px',
    margin: {
      t: 35,
      l: 85,
      r: 55,
      b: 190,
      pad: 4
    }
  }
}


let metadata = {
  version: '1.1.0',
  type: 'plot',
  attrs: {
    style: 'timeseries', // Style will be 'timeseries' or 'heatmap'
    }
  }
}

```
Note that these are the same inputs for data and layout as plotly normally takes in [`Plotly.newPlot()`](https://plotly.com/javascript/plotlyjs-function-reference/)

##### Sending plotly a csv file url

```javascript
let data = {
  url : 'https://example.com/myfile.csv'
}


let metadata= {
  version: '1.1.0',
  type: 'plot',
  attrs: {
    'x-axis-column': 2, // **Optional**
    style: 'timeseries',
    'y-axes-columns': [3, 4, 5, 6, 7, 8, 9, 10], // **Optional**
    'plot-layout': { // **Optional**
      height: '700px',
      margin: {
        t: 35,
        l: 85,
        r: 55,
        b: 190,
        pad: 4
      }
    }
  }
}

let supplementalData = {
  url : 'https://example.com/mySupplementalFile.json'
}
```

## CSV file formatting

`plotvuer` will load and csv file that follow the form of headers on first row and coloumn and if data is time based, rows will be assumed to be time dependant.

### Example 1. Heatmap data

|               | Gene 1  | Gene 2 |
| :------------ |:--------|  ------|
| Sample 1      | -1.54 | -3.40 |
| Sample 2      | 0.68       |   1.22 |
| Sample 3      | 0.05      |    0.66 |


### Example 2. Timeseries data


| time (seconds)| Sweep 0_Membrane Potential (mV) |
| :------------ |:--------|
| 0     | -70.12939453 |
| 0.0002    | -70.12939453     |
| 0.0004      | -70.34301758      |


## Copy and paste as an HTML widget
Paste the following lines in the `<body>` of you HTML
```HTML
 <!-- Modify the 'file' input to point to a csv file you wish to show -->
 <plot-vuer-widget file="https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-4/RNA_Seq.csv"></plot-vuer-widget>
 <!-- widget source css from cdn-->
 <link href="https://cdn.jsdelivr.net/npm/@tehsurfer/plotvuer-widget/dist/plotVuer.css" rel="stylesheet">
 <!-- widget source js from cdn -->
 <script src="https://cdn.jsdelivr.net/npm/@tehsurfer/plotvuer-widget/dist/plotVuer.js"></script>
```
### Modifying input file for widget
Change this line to point at a csv file for display
```HTML
 <!-- Modify the 'file' input to point to a csv file you wish to show -->
 <plot-vuer-widget file="./path/to/file.csv"></plot-vuer-widget>
```

## Developer Documentation

The documentation is developed with `vitepress` and `vuese`. Documentation pages are in the `docs` folder.

### To run in local development mode
```bash
npm run docs:watch
```

This will start the documentation server with `vitepress` on port `:5173` and watch the components' changes.
