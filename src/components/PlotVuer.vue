<template>
  <div class="plotvuer_parent" :title="collapseName">
    <div class="ui-controls">
      <el-popover content="Zoom In" placement="left" 
        :appendToBody=false trigger="manual" popper-class="plot-popper" v-model="hoverVisabilities[0].value">
        <el-button icon="el-icon-plus" circle class="zoomIn icon-button" 
          @click="zoomIn()" :disabled="zoomInDisabled" size="mini" slot="reference" @mouseover.native="showToolitip(0)" @mouseout.native="hideToolitip(0)"></el-button>
      </el-popover>
      <el-popover content="Zoom Out" placement="left"
        :appendToBody=false trigger="manual" popper-class="plot-popper" v-model="hoverVisabilities[1].value">
        <el-button icon="el-icon-minus" circle class="zoomOut icon-button"
        @click="zoomOut()" :disabled="zoomOutDisabled"  size="mini" slot="reference" @mouseover.native="showToolitip(1)" @mouseout.native="hideToolitip(1)"></el-button>
      </el-popover>
      <el-popover content="Reset view" placement="left"
        :appendToBody=false trigger="manual" popper-class="plot-popper" v-model="hoverVisabilities[2].value">
        <el-button icon="el-icon-refresh-right" circle class="resetView icon-button"
          @click="resetView()" size="mini" slot="reference" @mouseover.native="showToolitip(2)" @mouseout.native="hideToolitip(2)"></el-button>
      </el-popover>

    </div>
  
    <div class="controls" ref="controls">
      <div class='title'>{{title}}</div>

      <div v-if="plotType !== 'plotly-only'">
        <span>
        <el-select
          class="channel-select"
          ref="selectBox"
          v-model="channelx"
          multiple
          filterable
          collapse-tags
          default-first-option
          :popper-append-to-body="false"
          :placeholder="ui.placeholderx"
        >
          <el-option v-for="item in allChannelsX" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        </span>
        <span v-if="ui.showSecondSelector">
        <el-select
          class="channel-select"
          ref="selectBox2"
          v-model="channely"
          multiple
          filterable
          collapse-tags
          default-first-option
          :popper-append-to-body="false"
          :placeholder="ui.placeholdery"
        >
          <el-option v-for="item in allChannelsY" :key="item" :label="item" :value="item"></el-option>
        </el-select>
        </span>
        <span>
          <el-button class="view-heatmap-button" @click="ui.buttonPlot">{{ui.button}}</el-button>
        </span>
      </div>
    </div>
    
    <div ref="container" class="vue-plotly"/>
    
  </div>
</template>
<script>
/* eslint-disable no-alert, no-console */
import Plotly from './custom-plotly'
import Vue from "vue"
import { Select, Option, Collapse, CollapseItem, Button, Popover} from "element-ui"
import CsvManager from "./csv_manager"
import ReziseSensor from "css-element-queries/src/ResizeSensor"

Vue.use(Select)
Vue.use(Option)
Vue.use(Collapse)
Vue.use(CollapseItem)
Vue.use(Button)
Vue.use(Popover)

export default {
  name: "PlotVuer",
  props:{
    title:{
      type: String,
      default: '',
    },
    url:{
      type: String,
      default: '',
    },
    dataInput:{
      type: Array,
      default: () => []
    },
    plotType:{
      type: String,
      default: 'heatmap'
    },
    yAxisFilter: {
      type: Array,
      default: () => []
    },
    xAxisFilter: {
      type: Array,
      default: () => []
    },
    helpMode: {
      type: Boolean,
      default: false
    }
    
  },
  data: function() {
    return {
      allChannelsX: [],
      allChannelsY: [],
      data: [{ x: [], y: [], type: "scatter" }],
      layout: {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: {
          t: 5,
          l: 55,
          r: 55,
          b: 90,
          pad: 4
        },
        dragmode: 'pan' 
      },
      options: {
        type: Object
      },
      hoverVisabilities: [{value: false}, {value: false}, {value: false}, {value: false},{value: false}],
      inHelp: false,
      zoomLevel: 0,
      zoomInDisabled: false,
      zoomOutDisabled: true,
      watchShallow: false,
      csv: new CsvManager(),
      channelx: "Select a channel",
      channely: '',
      collapseName: "Options",
      buttonLabels: ["Plot As Heatmap", "Export as CSV"],
      selected: [],
      internalLayout: {
        ...this.layout,
        datarevision: 1
      }
    };
  },
  computed: {
    ui: function(){
      var ui = {}
      if(this.plotType === "heatmap"){
        ui = {
          'button': 'View Heatmap',
          'buttonPlot': this.heatmapPlot,
          'placeholderx': 'Select gene', 
          'placeholdery': 'Select cell/sample',
          'showFirstSelector': true,
          'showSecondSelector': true
        }
      } else {
        ui = {
          'button': 'View Plot',
          'buttonPlot': this.timeseriesPlot,
          'placeholderx': 'Select channel',
          'placeholdery': 'Select gene',
          'showFirstSelector': true,
          'showSecondSelector': false,
        }
      }
      return ui
    },
  },
  methods: {
    loadData: function(data) {
      if (this.plotType === 'plotly-only') {
          Plotly.newPlot(this.$refs.container, this.dataInput, this.layout, this.getOptions())
          return true
      } else {
        this.csv.loadData(data).then(() => {
          this.allChannelsX = this.csv.getHeaders();
          this.allChannelsY = this.csv.getColoumnByIndex(0)
          if (this.plotType === 'heatmap') {
            if (this.yAxisFilter.length > 1){
              this.channelx = this.yAxisFilter
              this.heatmapPlotAll()
            }
          } else {
            this.data[0].x = this.csv.getColoumnByIndex(0)
            this.data[0].y = this.csv.getColoumnByIndex(1)
            this.data[0].type = this.csv.getDataType()
            this.plot_channel(this.csv.getHeaderByIndex(1))
            Plotly.newPlot(this.$refs.container, this.data, this.layout, this.getOptions())
          }
          return true;
        });
      }
    },
    loadURL: function(url) {
      this.csv.loadFile(url).then(() => {
        this.allChannelsX = this.csv.getHeaders();
        this.allChannelsY = this.csv.getColoumnByIndex(0)
        if (this.plotType === 'heatmap') {
          if (this.yAxisFilter.length > 1){
            this.channelx = this.yAxisFilter
            this.channely = this.xAxisFilter
            this.heatmapPlot()
          }
          else{
            this.heatmapPlotAll()
          }
        } else {
          this.data[0].x = this.csv.getColoumnByIndex(0)
          this.data[0].y = this.csv.getColoumnByIndex(1)
          this.data[0].type = this.csv.getDataType()
          this.plot_channel(this.csv.getHeaderByIndex(1))
          Plotly.newPlot(this.$refs.container, this.data, this.layout, this.getOptions())
        }
        return true;
      });
    },
    plot_channel: function(channel = false) {
      if (channel){
        this.data[0].x = this.csv.getColoumnByIndex(0)
        this.data[0].y = this.csv.getColoumnByName(channel)
        this.data[0].type = this.csv.getDataType() 
      }
    },
    timeseriesPlot: function(){
      this.data = []
      for(let i in this.channelx){
        this.data.push([])
        this.data[i].x = this.csv.getColoumnByIndex(0)
        this.data[i].y = this.csv.getColoumnByName(this.channelx[i])
        this.data[i].type = this.csv.getDataType()
      }
      Plotly.react(this.$refs.container, this.data, this.layout, this.getOptions())
    },
    heatmapPlot: function (){
      var data = this.csv.getByAxes(this.channelx, this.channely)
      var tdata = [
          {
            z: data,
            x: this.channelx,
            y: this.channely,
            type: "heatmap"
          }
        ];
        Plotly.react(this.$refs.container, tdata, this.layout, this.getOptions())
      
    },
    heatmapPlotAll: function (){
      var tdata = [
          {
            z: this.csv.getAllData(),
            x: this.csv.getColoumnByIndex(0),
            y: this.csv.getHeaders(),
            type: "heatmap"
          }
        ];
        Plotly.react(this.$refs.container, tdata, this.layout, this.getOptions())
    },
    handleResize: function() {
      new ReziseSensor(this.$el, () => {
        // this.layout.title =
        //   "Width now:" + this.$el.clientWidth + " Height now: " + (this.$el.parentElement.clientHeight - this.$refs.selectBox.$el.clientHeight)
        Plotly.relayout(this.$refs.container, {
          width: this.$el.clientWidth,
          height: this.$el.parentElement.clientHeight - this.$refs.controls.clientHeight
        });
      });
    },
    zoomIn: function(){
      this.zoomLevel++
      this.$el.querySelector('a[data-attr="zoom"][data-val="in"]').click()
      this.setDisabledButtons(this.zoomLevel)
    },
    zoomOut: function(){
      this.zoomLevel--
      this.$el.querySelector('a[data-attr="zoom"][data-val="out"]').click()
      this.setDisabledButtons(this.zoomLevel)
    },
    setDisabledButtons(zoomLevel){
      if (zoomLevel === 8){
        this.zoomInDisabled = true
      } else {
        this.zoomInDisabled = false
      }
      if (zoomLevel === 0){
        this.zoomOutDisabled = true
      } else {
        this.zoomOutDisabled = false
      }
      return
    },
    resetView: function(){
      this.zoomLevel = 0
      this.$el.querySelector('a[data-attr="zoom"][data-val="reset"]').click()
      this.setDisabledButtons(this.zoomLevel)
    },
    setHelpMode: function(helpMode){
      if (helpMode){
        this.inHelp = true
        this.hoverVisabilities.forEach( (item) =>{
          item.value = true
        });
      } else {
        this.inHelp = false
        this.hoverVisabilities.forEach( (item) =>{
          item.value = false
        });
      }
    },
    showToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.hoverVisabilities[tooltipNumber].value = true;
        this.tooltipWait = setTimeout( ()=>{this.hoverVisabilities[tooltipNumber].value = true}, 1000)
      }
    },
    hideToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.hoverVisabilities[tooltipNumber].value = false
        clearInterval(this.tooltipWait)
      }
    },

    plot() {
      return Plotly.plot(this.$refs.container, this.data, this.layout, this.getOptions())
    },
    getOptions() {
      let el = this.$refs.container
      let opts = this.options

      // if width/height is not specified for toImageButton, default to el.clientWidth/clientHeight
      if (!opts) opts = {}
      if (!opts.toImageButtonOptions) opts.toImageButtonOptions = {}
      if (!opts.toImageButtonOptions.width) opts.toImageButtonOptions.width = el.clientWidth
      if (!opts.toImageButtonOptions.height) opts.toImageButtonOptions.height = el.clientHeight
      opts.scrollZoom = true
      return opts
    },
    newPlot() {
      return Plotly.newPlot(this.$refs.container, this.data, this.layout, this.getOptions())
    },
    react() {
      return Plotly.react(this.$refs.container, this.data, this.layout, this.getOptions())
    },
  },
  mounted() {
    if(this.url != ''){
      this.loadURL(this.url)
      this.react()
    } else if (this.dataInput.length != 0) {
      this.loadData(this.dataInput)
    }
    this.handleResize()
    this.$watch('data', () => {
      this.internalLayout.datarevision++
      this.react()
    }, { deep: !this.watchShallow })

    this.$watch('options', this.react, { deep: !this.watchShallow })
    this.$watch('layout', this.relayout, { deep: !this.watchShallow })
    
  },
  watch: {

    helpMode: function(val){
      this.setHelpMode(val)
    }
  },
  destroyed() {},
  beforeDestroy() {
    this.__generalListeners.forEach(obj => this.$refs.container.removeAllListeners(obj.fullName))
    Plotly.purge(this.$refs.container)
  }
};
</script>
<style scoped src="element-ui/lib/theme-chalk/index.css"></style>
<style scoped>
.controls{
  padding-left: 55px;
  padding-top: 5px;
  align-items: left;
  text-align: left;
}
.ui-controls{
  position: absolute;
  height: 100%;
  width: 40px;
  right: 0px;
  pointer-events: none;
  z-index: 5
}

@media only screen and (max-width: 48em) {
  .ui-controls {
    position: absolute;
    height: 100%;
    width: 40px;
    right: 0px;
    top: 100px;
    pointer-events: none;
    z-index: 5
  }
}


.title{
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
.view-heatmap-button{
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

.zoomIn{
  top:51px;
  right:20px;
  position: absolute;
  pointer-events: auto;
}
.zoomOut{
  top:90px;
  right:20px;
  position: absolute;
    pointer-events: auto;
}
.resetView {
  top:129px;
  right:20px;
  position: absolute;
    pointer-events: auto;
}
.icon-button {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  border: solid 1px #ffffff;
  background-color: #ffffff;
}
.freeSpin {
  bottom:79px;
  right:50%;
  position: absolute;
}
>>> .plot-popper {
  padding:9px 10px;
  min-width:150px;
  font-size:12px;
  color: #fff;
  background-color: #8300bf;  
}
>>> .plot-popper .popper__arrow::after{
  border-left-color: #8300bf !important;
}

>>> .el-select__tags-text {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
}
.modebar-container{
  display: none;
}
</style>

