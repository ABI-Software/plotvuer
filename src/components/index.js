// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import PlotVuer from './PlotVuer.vue'

export {PlotVuer}

import HeatmapPlot from './HeatmapPlot'
import TimeseriesPlot from './TimeseriesPlot'
if (HeatmapPlot || TimeseriesPlot) {
  // Are these things hidden?
}
