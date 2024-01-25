// in custom-plotly.js
import Plotly from 'plotly.js/lib/core'
import scatter from 'plotly.js/lib/scatter'
import bar from 'plotly.js/lib/bar'
import heatmap from 'plotly.js/lib/heatmap'

// Load in the trace types for pie, and choropleth
Plotly.register([scatter, bar, heatmap])
export default Plotly
