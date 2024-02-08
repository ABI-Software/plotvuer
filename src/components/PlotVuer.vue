<template>
  <div class="plotvuer_parent">
    <template v-if="plotType != '-plot'">
      <component
        :is="plotType"
        :sourceData="dataSource"
        :plotLayout="layout"
        :version="metadata.version"
        :metadata="metadata.attrs"
        :supplementalData="supplementalData"
      ></component>
    </template>
  </div>
</template>

<script>
import TimeseriesPlot from './TimeseriesPlot.vue'
import HeatmapPlot from './HeatmapPlot.vue'
const KNOWN_VERSIONS = ['1.2.0', '1.1.0']

export default {
  name: 'PlotVuer',
  components: {
    TimeseriesPlot,
    HeatmapPlot,
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
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          autosize: true,
          margin: {
            t: 25,
            l: 55,
            r: 55,
            b: 90,
            pad: 4
          },
          loading: false,
          options: {
            responsive: true,
            scrollZoom: true
         }
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
      return layout
    }
  },
}
</script>


<style scoped>
.plotvuer_parent {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
}
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
