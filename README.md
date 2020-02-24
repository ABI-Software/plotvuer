# plotvuer 

[![npm version](https://badge.fury.io/js/%40tehsurfer%2Fplotvuer.svg)](https://badge.fury.io/js/%40tehsurfer%2Fplotvuer)

This project aims to process and display csv files as graphs in the vue framework

![demo](https://user-images.githubusercontent.com/37255664/73617045-a3231e00-467f-11ea-90bd-b1074acd26b3.gif)

## Project installation
```
npm i @tehsurfer/plotvuer
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
import '@tehsurfer/plotvuer'
import '@tehsurfer/plotvuer/dist/plotvuer.css'
```

The codes above registers the ScaffoldVuer component into the global scope.
You can now use the ScaffoldVuer in your vue template as followed:
```html
<PlotVuer :url="csvfile.csv"></PlotVuer>
```
_Optional_ Add height of div
```html
<PlotVuer :url="csvfile.csv" :height="height"></PlotVuer>
```

`url` should be the variable/string containing the url of a csv file.
`height` is tracked and updated in plotly (Can't register height any other way atm)


Example site coming soon
