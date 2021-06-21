<template>
  <div class="container">
    <div ref="plotlyplot" class="vue-plotly" />
    <div class="chooser-container" :class="{inactive: loading}">
      <span>
        <el-select
          v-model="filterX"
          class="channel-select"
          multiple
          filterable
          collapse-tags
          default-first-option
          :popper-append-to-body="false"
          placeholder="select"
        >
          <el-option v-for="item in traceNames" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </span>
      <span>
        <el-button class="view-heatmap-button" @click="filterPlot">Filter plot</el-button>
      </span>
    </div>
    <plot-controls :parent-element="{element: $refs.plotlyplot}" :controls-enabled="!loading" />
  </div>
</template>

<script>
import Plotly from '@/js/custom_plotly'
import DataManager from '@/js/data_manager'
import PlotControls from '@/components/PlotControls'
import PlotCommon from '@/mixins/plot_common'

export default {
  name: 'TimeseriesPlot',
  components: {PlotControls},
  mixins: [PlotCommon],
  data: function () {
    return {
      dataValues: [],
      filterX: [],
      parsedData: null,
      time: [],
      traceData: null,
      traceNames: [],
      xAxisLabel: 'time'
    }
  },
  computed: {
    fullMetadata() {
      let metadata = JSON.parse(JSON.stringify(this.metadata))
      if (!metadata['y-axes-columns']) {
        metadata['y-axes-columns'] = [1, 2]
      }
      if (!metadata['x-axis-column']) {
        metadata['x-axis-column'] = 0
      }
      if (!metadata['no-header']) {
        metadata['no-header'] = false
      }
      if (!metadata['row-major']) {
        metadata['row-major'] = false
      }
      return metadata
    }
  },
  watch: {
    sourceData: {
      handler: function () {
        this.loading = true
        DataManager.loadFile(this.sourceData.url, this.dataReady)
        if (this.fullMetadata['no-header']) {
          DataManager.loadFile(this.supplementalData[0].url, this.headerDataReady)
        }
      },
      immediate: true
    }
  },
  methods: {
    dataReady(data) {
      this.loading = false
      this.parsedData = data
      this.populateTime()
      this.populateDataValues()
      if (!this.fullMetadata['no-header']) {
        this.populateXaxisLabel()
        this.populateTraceNames()
      }
      this.createPlot(this.time, this.xAxisLabel, this.dataValues, this.traceNames)
    },
    headerDataReady(data) {
      this.traceData = data
      this.populateXaxisLabel()
      this.populateTraceNames()
      if (!this.loading) {
        this.createPlot(this.time, this.xAxisLabel, this.dataValues, this.traceNames)
      }
    },
    filterPlot() {
      let xTraceNames = this.filterX
      if (xTraceNames.length === 0) {
        this.createPlot(this.time, this.xAxisLabel, this.dataValues, this.traceNames)
        return
      }
      let colIndeces = []
      for (let i of xTraceNames) {
        colIndeces.push(this.fullMetadata['y-axes-columns'][this.traceNames.indexOf(i)])
      }
      let all_data = [...this.parsedData.data]
      if (!this.fullMetadata['no-header']) {
        all_data = all_data.slice(1)
      }
      let datat = []
      for (let col of colIndeces) {
        const filteredCol = all_data.map(row => {
          return row[col]
        })
        datat.push(filteredCol)
      }
      this.createPlot(this.time, this.xAxisLabel, datat, xTraceNames)
    },
    createPlot(xValues, xValuesLabel, yValues, traceNames) {
      let tdata = []
      for (let i = 0; i < yValues.length; i++) {
        tdata.push({
          type: 'scatter',
          mode: 'lines',
          name: traceNames[i],
          x: xValues,
          y: yValues[i]
        })
      }
      const timeseriesLayout = {title: {text: this.title}, xaxis: {title: {text: xValuesLabel}}}
      Plotly.react(this.$refs.plotlyplot, tdata, {...this.layout, ...timeseriesLayout, ...this.plotLayout}, this.options) //this.getOptions())
    },
    populateXaxisLabel() {
      if (this.fullMetadata['no-header']) {
        this.xAxisLabel = this.traceData.data[0][this.fullMetadata['x-axis-column']]
      } else {
        this.xAxisLabel = this.parsedData.data[0][this.fullMetadata['x-axis-column']]
      }
    },
    populateTraceNames() {
      if (this.fullMetadata['no-header']) {
        this.traceNames.splice(0, this.traceNames.length)
        for (let col of this.fullMetadata['y-axes-columns']) {
          this.traceNames.push(this.traceData.data[0][col])
        }
        this.$set(this.traceNames, 0, this.traceNames[0])
      } else {
        this.traceNames = []
        for (let col of this.fullMetadata['y-axes-columns']) {
          this.traceNames.push(this.parsedData.data[0][col])
        }
      }
    },
    populateTime() {
      const this_ = this
      let all_data = [...this.parsedData.data]
      if (!this.fullMetadata['no-header']) {
        all_data = all_data.slice(1)
      }
      this.time = all_data.map(function (row) {
        return row[this_.fullMetadata['x-axis-column']]
      })
    },
    populateDataValues() {
      let all_data = [...this.parsedData.data]
      if (!this.fullMetadata['no-header']) {
        all_data = all_data.slice(1)
      }
      let datat = []
      for (let col of this.fullMetadata['y-axes-columns']) {
        const filteredRow = all_data.map(row => {
          return row[col]
        })
        datat.push(filteredRow)
      }
      this.dataValues = datat
    }
  }
}
</script>

<style scoped></style>
