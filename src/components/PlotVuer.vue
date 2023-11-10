<template>
  <div class="plotvuer_parent">
    <template v-if="!plotlyOnly">
      <component
        :is="plotType"
        :source-data="dataSource"
        :plot-layout="layout"
        :version="metadata.version"
        :metadata="metadata.attrs"
        :supplemental-data="supplementalData"
      ></component>
    </template>
    <template v-else>
      <component
        :is="'plotvuer-original'"
        :data-input="dataSource" 
        :plotType="'plotly-only'"
        ></component>
    </template>
  </div>
</template>

<script>
const KNOWN_VERSIONS = ['1.2.0', '1.1.0']

export default {
  name: 'PlotVuer',
  components: {
    'heatmap-plot': () => import('@/components/HeatmapPlot'),
    'timeseries-plot': () => import('@/components/TimeseriesPlot'),
    'plotvuer-original': () => import('@/components/PlotVuer-original')
  },
  props: {
    dataSource: {
      type: Object,
      default: () => {}
    },
    plotlyOnly: {
      type: Boolean,
      default: false
    },
    metadata: {
      type: Object,
      required: false,
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
    },
    layout: function () {
      // return layout in metadat if it exists. If not use the prop
      let layout = this.metadata
        ? this.metadata.attrs
          ? this.metadata.attrs.layout
            ? this.metadata.attrs.layout
            : this.plotLayout
          : this.plotLayout
        : this.plotLayout
      layout.height = layout.height ? layout.height : 667 // set default height
      return layout
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
