<template>
  <div class="plotvuer_parent" :title="collapseName" >
    <SvgSpriteColor/>
    <div class="controls" ref="controls">
      <div class='title'>{{title}}j</div>

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
    <div class="bottom-right-control" ref="zoomControls">
        <el-popover content="Zoom in" placement="left" 
          :appendToBody=false trigger="manual" popper-class="plot-popper" v-model="hoverVisibilities[0].value">
          <svg-icon icon="zoomIn" class="icon-button zoomIn" slot="reference" @click.native="zoomIn()"
            @mouseover.native="showToolitip(0)" @mouseout.native="hideToolitip(0)"/>
        </el-popover>
        <el-popover content="Zoom out" placement="top-end"
          :appendToBody=false trigger="manual" popper-class="plot-popper popper-zoomout" v-model="hoverVisibilities[1].value">
          <svg-icon icon="zoomOut" class="icon-button zoomOut" slot="reference" @click.native="zoomOut()"
            @mouseover.native="showToolitip(1)" @mouseout.native="hideToolitip(1)"/>
        </el-popover>
        <el-select size="mini" v-model="selectZoom" placeholder="100%" class="zoomSelect" @change="selectZoomChange">
          <el-option
            v-for="item in zoomSelect"
            :key="item.value"
            :label="item.label"
            :value="item.label">
          </el-option>
        </el-select>
        <el-popover content="Reset" placement="top"
          :appendToBody=false trigger="manual" popper-class="plot-popper" v-model="hoverVisibilities[2].value">
          <svg-icon icon="resetZoom" class="icon-button resetView" slot="reference" @click.native="resetView()"
            @mouseover.native="showToolitip(2)" @mouseout.native="hideToolitip(2)"/>
        </el-popover>
    </div>
    
  </div>
</template>
<script>
/* eslint-disable no-alert, no-console */
import Plotly from './custom-plotly'
import Vue from "vue"
import { Select, Option, Collapse, CollapseItem, Button, Popover} from "element-ui"
import {SvgSpriteColor, SvgIcon} from '@abi-software/svg-sprite'
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
  components: {
    SvgSpriteColor,
    SvgIcon
  },
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
      hoverVisibilities: [{value: false}, {value: false}, {value: false}, {value: false},{value: false}],
      zoomSelect: [{
          value: '1',
          label: '100%'
        }],
      selectZoom: '100%',
      zoom: 100,
      maxZoom: 800,
      inHelp: false,
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
          'buttonPlot': this.heatmapPlotWithFilters,
          'placeholderx': 'Select gene', 
          'placeholdery': 'Select cell/sample',
          'showFirstSelector': true,
          'showSecondSelector': true
        }
      } else {
        ui = {
          'button': 'View Plot',
          'buttonPlot': this.timeseriesSelectedChannelsPlot,
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
      // Send data to plotly directly if 'plotly-only' is specified
      if (this.plotType === 'plotly-only') {
          Plotly.newPlot(this.$refs.container, this.dataInput, this.layout, this.getOptions())
          return 
      } else { // Else we treat the data as if it was in csv format
        this.csv.loadData(data).then(() => {
          this.findTypeThenPlot()
        });
      }
    },
    // loadURL: Takes a url pointing to a csv file as input and plots it
    loadURL: function(url) {
      this.csv.loadFile(url).then(() => {
        this.findTypeThenPlot()
      });
    },
    // findTypeThenPlot: Check the inputs (props) to Plotvuer and plot accordingly
    findTypeThenPlot: function(){
      this.allChannelsX = this.csv.getHeadersExceptForFirst();
      this.allChannelsY = this.csv.getColoumnByIndex(0)
      // Check if plot type is provided
      if (this.plotType === 'heatmap') {
        // Check if filters are definded
        if (this.yAxisFilter.length > 1){
          this.channelx = this.yAxisFilter
          this.channely = this.xAxisFilter
          this.heatmapPlotWithFilters()
        }
        // Plot all data if no filters are defined
        else{
          this.heatmapPlotAll()
        }
      } else { // If no plot type is defined, we attempt to deduce it with 'getDataType'
        this.data[0].x = this.csv.getColoumnByIndex(0)
        this.data[0].y = this.csv.getColoumnByIndex(1)
        this.data[0].type = this.csv.getDataType()
        this.plot_channel(this.csv.getHeaderByIndex(1))
        Plotly.newPlot(this.$refs.container, this.data, this.layout, this.getOptions())
      }
    },
    // plot_channel: plot a singular channel from a given coloumn name
    plot_channel: function(channel = false) {
      if (channel){
        this.data[0].x = this.csv.getColoumnByIndex(0)
        this.data[0].y = this.csv.getColoumnByName(channel)
        this.data[0].type = this.csv.getDataType() 
      }
    },
    // timeseriesSelectedChannelsPlot: Plot all selected channels
    timeseriesSelectedChannelsPlot: function(){
      this.data = []
      for(let i in this.channelx){
        this.data.push([])
        this.data[i].x = this.csv.getColoumnByIndex(0)
        this.data[i].y = this.csv.getColoumnByName(this.channelx[i])
        this.data[i].type = this.csv.getDataType()
      }
      Plotly.react(this.$refs.container, this.data, this.layout, this.getOptions())
    },
    // heatmapPlotWithFilters: Plot a heatmap with given x and y filters
    heatmapPlotWithFilters: function (){
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
    // heatmapPlotAll: plot all data avialable for heatmap 
    heatmapPlotAll: function (){
      var tdata = [
          {
            z: this.csv.getDataValuesOnly(),
            x: this.csv.getHeadersExceptForFirst(),
            y: this.csv.getColoumnByIndex(0)  ,
            type: "heatmap"
          }
        ];
        Plotly.react(this.$refs.container, tdata, this.layout, this.getOptions())
    },
    // handleResize: listener to resize plotly canvas and redraw
    handleResize: function() {
      new ReziseSensor(this.$el, () => {
        window.zzzz = this.$refs.zoomControls
        window.hhhh = this.$refs.zoomControls.clientHeight
        // this.layout.title =
        //   "Width now:" + this.$el.clientWidth + " Height now: " + (this.$el.parentElement.clientHeight - this.$refs.selectBox.$el.clientHeight)
        Plotly.relayout(this.$refs.container, {
          width: this.$el.clientWidth,
          height: this.$el.parentElement.clientHeight - this.$refs.controls.clientHeight
        });
        this.$refs.zoomControls.style.top =  String(this.$el.parentElement.clientHeight - this.$refs.zoomControls.clientHeight - 16 ) + 'px'
      });
    },
    // zoomIn: Findd and clickd the plolty modebar 'zoom in' 
    zoomIn: function(){
      this.zoom += 100
      this.$el.querySelector('a[data-attr="zoom"][data-val="in"]').click()
      this.setDisabledButtons(this.zoom)
      this.updateZoomSelect(this.zoom)
    },
    // zoomOut: Find and clickd the plolty modebar 'zoom out' 
    zoomOut: function(){
      this.zoom -= 100
      this.$el.querySelector('a[data-attr="zoom"][data-val="out"]').click()
      this.setDisabledButtons(this.zoom)
      this.updateZoomSelect(this.zoom)
    },
    // setDisabledButtons(zoomLevel): Disable buttons once they hit max zoom
    setDisabledButtons(zoom){
      if (zoom === this.maxZoom){
        this.zoomInDisabled = true
      } else {
        this.zoomInDisabled = false
      }
      if (zoom === 0){
        this.zoomOutDisabled = true
      } else {
        this.zoomOutDisabled = false
      }
      return
    },
    resetView: function(){
      this.zoom = 100
      this.$el.querySelector('a[data-attr="zoom"][data-val="reset"]').click()
      this.setDisabledButtons(this.zoom)
      this.updateZoomSelect(this.zoom)
    },
    percentToNum(percentage){
      return Number(percentage.slice(0, -1))  
    },
    selectZoomChange: function(requestedZoomPercentage){
      if(requestedZoomPercentage === '100%'){
        this.resetView()
        return
      }
      let newZoom = this.percentToNum(requestedZoomPercentage)
      let zoomDiff =  Math.round((newZoom - this.zoom)/100)
      console.log(zoomDiff)
      for (let i= 0; i < Math.abs(zoomDiff); i++){
        if (zoomDiff > 0) {
          this.zoomIn()
        } else {
          this.zoomOut()
        }
      }
      this.updateZoomSelect(newZoom)
    },
    updateZoomSelect(percentage){
      this.selectZoom = String(percentage) + '%'
    },
    createZoomPercentages: function(){
      this.zoomSelect = []
      for(let i= 0; i <= this.maxZoom/100; i++){
        this.zoomSelect.push({
          value: i,
          label: (i+1)*100 + '%'
        })
      }
    },
    setHelpMode: function(helpMode){
      if (helpMode){
        this.inHelp = true
        this.hoverVisibilities.forEach( (item) =>{
          item.value = true
        });
      } else {
        this.inHelp = false
        this.hoverVisibilities.forEach( (item) =>{
          item.value = false
        });
      }
    },
    showToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.hoverVisibilities[tooltipNumber].value = true;
        this.tooltipWait = setTimeout( ()=>{this.hoverVisibilities[tooltipNumber].value = true}, 1000)
      }
    },
    hideToolitip: function(tooltipNumber){
      if (!this.inHelp){
        this.hoverVisibilities[tooltipNumber].value = false
        clearInterval(this.tooltipWait)
      }
    },
    handleWheel: function(event){
      console.log(event)
      window.zoomp = this.zoom
      let change = Math.round( event.deltaY / 7 )
      this.zoom = this.zoom - change
      this.updateZoomSelect(this.zoom)
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
    this.$refs.container.addEventListener('wheel', this.handleWheel);
    this.createZoomPercentages()
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
    dataInput: function() {	
      this.loadData(this.dataInput)	
    },
    helpMode: function(val){
      this.setHelpMode(val)
    }
  },
  destroyed() {
    this.$refs.container.removeEventListener('wheel', this.handleWheel);
  },
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

.bottom-right-control {
  position:absolute;
  right:16px;
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

.icon-button {
  background-color: #ffffff;
  margin-left: 8px;
  height:24px!important;
  width:24px!important;
}

.icon-button:hover {
  cursor:pointer;
}

.zoomSelect >>> .el-input__inner{
  padding: 0px;
  height: 24px;
  padding-left: 4px;
  width: 60px;
  margin-left: 8px;
}

.zoomSelect >>> .el-select__caret{
  width: 8px;
  margin-right: 2px;
  margin-top: 2px;
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
>>> .modebar-container{
  display: none;
}
</style>

