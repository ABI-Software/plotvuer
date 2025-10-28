<template>
  <div ref="plotContainer" class="container">
    <div ref="plotlyplot" class="vue-plotly" />
    <div v-if="selectorUi" class="chooser-container" :class="{inactive: loading}">
      <span>
        <el-select
          v-model="filterX"
          class="channel-select"
          multiple
          filterable
          collapse-tags
          default-first-option
          placeholder="select"
        >
          <el-option v-for="item in columnHeaders" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </span>
      <span>
        <el-select
          v-model="filterY"
          class="channel-select"
          multiple
          filterable
          collapse-tags
          default-first-option
          placeholder="select"
        >
          <el-option v-for="item in rowHeaders" :key="item" :label="item" :value="item"></el-option>
        </el-select>
      </span>
      <span>
        <el-button class="view-heatmap-button" @click="filterPlot">Filter plot</el-button>
      </span>
      <span v-if="logScaleEnabled">
        <el-button class="view-heatmap-button" @click="logToggle">Toggle log</el-button>
      </span>
    </div>
    <plot-controls :parent-element="{element: $refs.plotContainer}" :controls-enabled="!loading" />
  </div>
</template>

<script>
import { markRaw } from 'vue'
import DataManager from '@/js/data_manager'
import PlotCommon from '@/mixins/plot_common'
import PlotControls from '@/components/PlotControls.vue'
import Plotly from '@/js/custom_plotly'

import { ElSelect, ElOption, ElCollapse, ElCollapseItem, ElButton, ElPopover } from 'element-plus';

export default {
  name: 'HeatmapPlot',
  components: {
    PlotControls,
    ElSelect,
    ElOption,
    ElCollapse,
    ElCollapseItem,
    ElButton,
    ElPopover
  },
  mixins: [PlotCommon],
  data: function () {
    return {
      columnHeaders: [],
      rowHeaders: [],
      dataValues: markRaw([]),
      filterX: [],
      filterY: [],
      loading: false,
      logScale: false,
      logDataValues: markRaw([]),
      resizeObserver: null,
    }
  },
  computed: {
    fullMetadata() {
      let metadata = JSON.parse(JSON.stringify(this.metadata))
      if (!metadata.columnHeaderSize) {
        metadata.columnHeaderSize = 1
      }
      if (!metadata.columnHeaderIndex) {
        metadata.columnHeaderIndex = 0
      }
      if (!metadata.rowHeaderSize) {
        metadata.rowHeaderSize = 1
      }
      if (!metadata.rowHeaderIndex) {
        metadata.rowHeaderIndex = 0
      }
      return metadata
    },
    logScaleEnabled() {
      let metadata = JSON.parse(JSON.stringify(this.metadata))
      return metadata.logScale ? true : false
    },
    plotTitle() {
      return this.logScale ? this.title + ' (Log scale)' : this.title
    }
  },
  watch: {
    sourceData: function () {
      this.loadData(this.sourceData)
    }
  },
  mounted: function () {
    this.loadData(this.sourceData)
    this.resizeObserver = new ResizeObserver(() => {
      if (this.$refs.plotlyplot) {
        Plotly.Plots.resize(this.$refs.plotlyplot)
      }
    })
    this.resizeObserver.observe(this.$refs.plotContainer)
  },
  beforeUnmount: function () {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }
  },
  methods: {
    loadData(sourceData) {
      if (sourceData.url) {
        this.loading = true
        DataManager.loadFile(sourceData.url, this.dataReady) // Use url
      } else {
        Plotly.react(this.$refs.plotlyplot, this.sourceData.data, this.sourceData.layout ? this.sourceData.layout : this.layout, this.options) // Use plolty input
      }
    },
    dataReady(data) {
      this.loading = false
      const parsedData = data
      this.populateColumnHeaders(parsedData)
      this.populateRowHeaders(parsedData)
      this.populateDataValues(parsedData)
      if (this.logScaleEnabled) {
        this.logValues()
        this.logScale = true
        this.createPlot(this.columnHeaders, this.rowHeaders, this.logDataValues, 'heatmap')
      } else {
        this.createPlot(this.columnHeaders, this.rowHeaders, this.dataValues, 'heatmap')
      }
    },
    logValues() {
      this.dataValues.forEach((r, i) => {
        this.logDataValues.push([])
        r.forEach(c => {
          this.logDataValues[i].push(Math.log10(c))
        })
      })
    },
    logToggle() {
      if (this.logScale) {
        this.logScale = false
        this.createPlot(this.columnHeaders, this.rowHeaders, this.dataValues, 'heatmap')
      } else {
        this.logScale = true
        this.createPlot(this.columnHeaders, this.rowHeaders, this.logDataValues, 'heatmap')
      }
    },
    filterPlot() {
      let xHeaders = this.filterX
      let yHeaders = this.filterY
      if (xHeaders.length === 0 && yHeaders.length === 0) {
        this.createPlot(this.columnHeaders, this.rowHeaders, this.dataValues, 'heatmap')
        return
      }
      if (xHeaders.length === 0) {
        xHeaders = this.columnHeaders
      }
      if (yHeaders.length === 0) {
        yHeaders = this.rowHeaders
      }
      let colIndeces = []
      for (let i of xHeaders) {
        colIndeces.push(this.columnHeaders.indexOf(i))
      }
      let rowIndexes = []
      for (let i of yHeaders) {
        rowIndexes.push(this.rowHeaders.indexOf(i))
      }
      let datat = []
      for (let col of colIndeces) {
        const filteredCol = this.dataValues.map(row => {
          return row[col]
        })
        let filteredRow = []
        for (let row of rowIndexes) {
          filteredRow.push(filteredCol[row])
        }
        datat.push(filteredRow)
      }
      // Transpose the data values.
      datat = datat[0].map((col, i) => datat.map(row => row[i]))
      this.createPlot(xHeaders, yHeaders, datat, 'heatmap')
    },
    createPlot(xValues, yValues, zValues, plotType) {
      var tdata = [
        {
          x: xValues,
          y: yValues,
          z: zValues,
          type: plotType
        }
      ]
      const heatmapLayout = {title: {text: this.plotTitle}}
      Plotly.react(this.$refs.plotlyplot, tdata, {...this.layout, ...heatmapLayout, ...this.plotLayout}, this.options) //this.getOptions())
    },
    populateColumnHeaders(parsedData) {
      let all_data = parsedData.data
      let headers = [...all_data[this.fullMetadata.columnHeaderIndex]]
      this.columnHeaders = headers.slice(this.fullMetadata.rowHeaderSize)
    },
    populateRowHeaders(parsedData) {
      let all_data = parsedData.data
      const col = all_data.map(row => {
          return row[this.fullMetadata.rowHeaderIndex]
        })
      this.rowHeaders = col.slice(this.fullMetadata.columnHeaderSize)
    },
    populateDataValues(parsedData) {
      let all_data = parsedData.data
      const headers_removed = all_data.slice(this.fullMetadata.columnHeaderSize)
      this.dataValues = markRaw(headers_removed.map((row) => {
        return row.slice(this.fullMetadata.rowHeaderSize)
      }))
    }
  }
}
</script>

<style scoped>
@import '../assets/bottom-right-control.scss';

.controls {
  padding-left: 55px;
  padding-top: 5px;
  align-items: left;
  text-align: left;
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
  min-width: 220px;
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
</style>
