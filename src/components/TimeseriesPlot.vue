<template>
  <div ref="plotContainer" class="container">
    <div ref="plotlyplot" class="vue-plotly" />
    <div v-if="selectorUi" class="chooser-container" :class="{inactive: loading}">
      <span>
        <el-select
          ref="selectBox"
          v-model="filterX"
          class="channel-select"
          size="large"
          multiple
          filterable
          collapse-tags
          default-first-option
          :teleported=false
          placeholder="select"
        >
          <el-option v-for="item in traceNames" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </span>
      <span>
        <el-button class="view-heatmap-button" @click="filterPlot">Filter plot</el-button>
      </span>
    </div>
    <plot-controls ref="controls" :parent-element="{element: $refs.plotContainer}" :controls-enabled="!loading" />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import Plotly from '@/js/custom_plotly'
import DataManager from '@/js/data_manager'
import PlotControls from '@/components/PlotControls.vue'
import PlotCommon from '@/mixins/plot_common'
import { ElSelect, ElButton, ElOption } from 'element-plus';


export default {
  name: 'TimeseriesPlot',
  components: {PlotControls, ElSelect, ElButton, ElOption},
  mixins: [PlotCommon],
  data: function () {
    return {
      dataValues: markRaw([]),
      filterX: [],
      parsedData: null,
      time: [],
      traceData: markRaw(null),
      traceNames: [],
      xAxisLabel: 'time'
    }
  },
  computed: {
    fullMetadata() {
      let metadata = JSON.parse(JSON.stringify(this.metadata))
      if (!metadata['y-axes-columns']) {
        metadata['y-axes-columns'] = []
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
    sourceData: function () {
      this.loadData(this.sourceData)
    }
  },
  mounted: function () {
    this.loadData(this.sourceData)
  },
  methods: {
    loadData(sourceData) {
      if (sourceData.url) {
        this.loading = true
        DataManager.loadFile(sourceData.url, this.dataReady) // Use url
      } else {
        Plotly.react(this.$refs.plotlyplot, this.sourceData.data, this.plotLayout ? this.plotLayout : this.layout, this.options) // Use plolty input
      }
    },
    dataReady(data) {
      if (this.fullMetadata['no-header']) {
        DataManager.loadFile(this.supplementalData[0].url, this.headerDataReady)
      }
      this.loading = false
      // this.handleResize()
      this.parsedData = markRaw(data)
      this.findYaxesCols()
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
      let currentLayout = this.plotLayout ? this.plotLayout : this.layout
      let newContent = {title: {text: this.title}, xaxis: {title: {text: xValuesLabel}}}
      let tlayout = {...currentLayout, ...newContent}
      Plotly.react(this.$refs.plotlyplot, tdata, tlayout, this.options) //this.getOptions())
    },
    findYaxesCols() {
      if (this.fullMetadata['y-axes-columns'].length === 0) {
        let yCols = [...Array(this.parsedData.data[0].length).keys()] // count up to number of coloumns
        yCols.shift()
        yCols.shift() // remove first two values
        this.fullMetadata['y-axes-columns'] = yCols
      }
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
      this.dataValues = markRaw(datat)
    }
  }
}
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
}

.vue-plotly {
  width: 100%;
  height: 80%;
}

.controls {
  padding-left: 55px;
  padding-top: 5px;
  align-items: left;
  text-align: left;
}

.bottom-right-control {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 3;
}

@media only screen and (max-width: 48em) {
  .ui-controls {
    position: absolute;
    height: 100%;
    width: 40px;
    right: 0px;
    top: 160px;
    pointer-events: none;
    z-index: 5;
  }
}

.title {
  width: 572px;
  height: 17px;
  font-family: Helvetica;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #606266;
  padding-top: 8px;
  padding-bottom: 8px;
}
.options {
  position: absolute;
  z-index: 11000;
  height: calc(100% - 20px);
  text-align: right;
  overflow: auto;
  padding-top: 8px;
  padding-bottom: 8px;
}

.channel-select {
  max-width: 320px;
  margin: 8px;
  margin-left: 0px;
  margin-right: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
}
.view-heatmap-button {
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  border: solid 1px #d8dce6;
  background-color: #8300bf;
  margin: 8px;
  margin-left: 0px;
  margin-right: 16px;

  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  color: white;
}
.input-div {
  display: flex;
  justify-content: space-between;
}

.icon-button {
  background-color: #ffffff;
  margin-left: 8px;
  height: 24px !important;
  width: 24px !important;
}

.icon-button:hover {
  cursor: pointer;
}

.el-select-dropdown__item {
  font-family: Arial, Helvetica, sans-serif;
}

.zoomSelect :deep( .el-input__inner ){
  padding: 0px;
  height: 24px;
  padding-left: 4px;
  width: 60px;
  margin-left: 8px;
}

.zoomSelect :deep( .el-select__caret ){
  width: 8px;
  margin-right: 2px;
  margin-top: 2px;
}

.bottom-right-control :deep( .plot-popper ){
  padding: 9px 10px;
  min-width: 150px;
  font-size: 12px;
  color: #fff;
  background-color: #8300bf;
}
.bottom-right-control :deep( .plot-popper .popper__arrow::after ){
  border-left-color: #8300bf !important;
}

.bottom-right-control :deep( .el-select__tags-text ){
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}
</style>
