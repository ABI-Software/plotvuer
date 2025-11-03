<template>
  <div class="plotvuer_parent">
    <template v-if="plotType != '-plot'">
      <component
        :is="plotType"
        :sourceData="dataSource"
        :plotLayout="layout"
        :version="metadata.version"
        :metadata="metadata.attrs"
        :selectorUi="selectorUi"
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
    /**
     * The object with `url` property
     * where the `url` is the source url to load the data.
     */
    dataSource: {
      type: Object,
      required: true,
      default: () => {}
    },
    /**
     * The metadata object
     * with `version`, `type`, and `attrs` properties.
     */
    metadata: {
      type: Object,
      required: true,
      validator: function (value) {
        return KNOWN_VERSIONS.includes(value.version) && value.type === 'plot'
      }
    },
    /**
     * The plotLayout for UI.
     */
    plotLayout: {
      type: Object,
      /**
       * `{
       * paper_bgcolor: 'rgba(0,0,0,0)',
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
       * }`
       */
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
    /**
     * The supplemental data to load.
     */
    supplementalData: {
      type: Array,
      default: () => []
    },
    /**
     * The option to choose helpMode.
     */
    helpMode: {
      type: Boolean,
      default: false
    },
    /**
     * The option to show the selector UI.
     */
    selectorUi: {
      type: Boolean,
      default: true
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
  min-height: 160px;
  width: 100%;
  padding-bottom: 8px;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
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
