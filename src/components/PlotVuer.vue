<template>
  <div class="plotvuer_parent">
    <component
      :is="plotType"
      :source-data="dataSource"
      :plot-layout="plotLayout"
      :version="metadata.version"
      :metadata="metadata.attrs"
      :supplemental-data="supplementalData"
    ></component>
  </div>
</template>

<script>
const KNOWN_VERSIONS = ['1.2.0', '1.1.0']

export default {
  name: 'PlotVuer',
  components: {
    'heatmap-plot': () => import('@/components/HeatmapPlot'),
    'timeseries-plot': () => import('@/components/TimeseriesPlot')
  },
  props: {
    dataSource: {
      type: Object,
      default: () => {}
    },
    metadata: {
      type: Object,
      required: true,
      validator: function (value) {
        return KNOWN_VERSIONS.includes(value.version) && value.type === 'plot'
      }
    },
    plotLayout: {
      type: Object,
      default: () => {
        return {
          height: 667
        }
      }
    },
    supplementalData: {
      type: Array,
      default: () => []
    },
    helpMode: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    plotType: function () {
      return this.metadata.attrs.style + '-plot'
    }
  }
}
</script>

<style scoped src="element-ui/lib/theme-chalk/index.css"></style>

<style scoped>
/* .plotvuer_parent {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
} */
</style>

<style>
.modebar-container {
  display: none;
}

.inactive {
  pointer-events: none;
  opacity: 0.4;
}
</style>
