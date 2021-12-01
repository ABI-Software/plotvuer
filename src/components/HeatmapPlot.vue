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
          :popper-append-to-body="false"
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
    <plot-controls :parent-element="{element: $refs.plotlyplot}" :controls-enabled="!loading" />
  </div>
</template>

<script>
import DataManager from '@/js/data_manager'
import PlotCommon from '@/mixins/plot_common'
import PlotControls from '@/components/PlotControls'
import Plotly from '@/js/custom_plotly'

export default {
  name: 'HeatmapPlot',
  components: {PlotControls},
  mixins: [PlotCommon],
  data: function () {
    return {
      columnHeaders: [],
      rowHeaders: [],
      dataValues: [],
      filterX: [],
      filterY: [],
      parsedData: null,
      loading: false,
      logScale: false,
      logDataValues: []
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
    sourceData: {
      handler: function () {
        this.loading = true
        DataManager.loadFile(this.sourceData.url, this.dataReady)
      },
      immediate: true
    }
  },
  methods: {
    dataReady(data) {
      this.loading = false
      this.parsedData = data
      this.populateColumnHeaders()
      this.populateRowHeaders()
      this.populateDataValues()
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
    populateColumnHeaders() {
      let all_data = [...this.parsedData.data]
      let headers = [...all_data[this.fullMetadata.columnHeaderIndex]]
      this.columnHeaders = headers.slice(this.fullMetadata.rowHeaderSize)
    },
    populateRowHeaders() {
      let all_data = [...this.parsedData.data]
      const col = [
        ...all_data.map(row => {
          return row[this.fullMetadata.rowHeaderIndex]
        })
      ]
      this.rowHeaders = col.slice(this.fullMetadata.columnHeaderSize)
    },
    populateDataValues() {
      const this_ = this
      let all_data = [...this.parsedData.data]
      const headers_removed = all_data.slice(this.fullMetadata.columnHeaderSize)
      this.dataValues = headers_removed.map(function (row) {
        return row.slice(this_.fullMetadata.rowHeaderSize)
      })
    }
  }
}
</script>
