<template>
  <div class="plotvuer_parent" :title="collapseName">
    <div class="controls" ref="controls">
    <div class='title'>RNA Sequences</div>
    <!-- <span class="options">
      <el-collapse>
        <el-collapse-item :title="collapseName">
          <div class="input-div">
            <el-checkbox
              style="margin-top:3px;"
              :checked="false"
              @change="plotAsHeatmap($event)"
              border
            >Plot as heatmap</el-checkbox>
          </div>
          <div class="input-div">
            <el-checkbox :checked="false" @change="switchAxes()" border>Flip Axes</el-checkbox>
          </div>
          <div class="input-div">
            <el-button @click="exportAsCSV()">Download as csv file</el-button>
          </div>
        </el-collapse-item>
      </el-collapse>
    </span> -->
    <span >
    <el-select
      class="channel-select"
      ref="selectBox"
      v-model="channelx"
      multiple
      filterable
      default-first-option
      placeholder="Select cell/sample"
    >
      <el-option v-for="item in allChannelsX" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    </span>
    <span>
    <el-select
      class="channel-select"
      ref="selectBox2"
      v-model="channely"
      multiple
      filterable
      default-first-option
      placeholder="Select gene"
    >
      <el-option v-for="item in allChannelsY" :key="item" :label="item" :value="item"></el-option>
    </el-select>
    </span>
    <span>
      <el-button class="view-heatmap-button" @click="heatmapPlot()">View Heatmap</el-button>
    </span>
    </div>
    
    <div ref="container" class="vue-plotly"/>
    
  </div>
</template>
<script>
import Plotly from './custom-plotly'
import Vue from "vue";
import { Select, Option, Collapse, CollapseItem, Button } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import CsvManager from "./csv_manager";
import ReziseSensor from "css-element-queries/src/ResizeSensor";

const events = [
  'click',
  'hover',
  'unhover',
  'selecting',
  'selected',
  'restyle',
  'relayout',
  'autosize',
  'deselect',
  'doubleclick',
  'redraw',
  'animated',
  'afterplot'
]

const functions = [
  'restyle',
  'relayout',
  'update',
  'addTraces',
  'deleteTraces',
  'moveTraces',
  'extendTraces',
  'prependTraces',
  'purge'
]

const methods = functions.reduce((all, funcName) => {
  all[funcName] = function(...args) {
    return Plotly[funcName].apply(Plotly, [this.$refs.container].concat(args))
  }
  return all
}, {})

Vue.use(Select);
Vue.use(Option);
Vue.use(Collapse);
Vue.use(CollapseItem);
Vue.use(Button)
export default {
  name: "PlotVuer",
  props: ["url", "plotType"],
  data: function() {
    return {
      allChannelsX: [],
      allChannelsY: [],
      data: [{ x: [], y: [], type: "scatter" }],
      layout: {
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)",
        margin: {
          t: 40,
          l: 40,
          r: 40,
          b: 40,
          pad: 4
        }
      },
      options: {
        type: Object
      },
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
  methods: {
    loadURL: function(url) {
      this.csv.loadFile(url).then(() => {
        this.allChannelsX = this.csv.getHeaders();
        this.allChannelsY = this.csv.getColoumnByIndex(0)
        if (this.plotType === 'heatmap') {
          this.plotAsHeatmap(true)
        } else {
          this.data[0].x = this.csv.getColoumnByIndex(0);
          this.data[0].y = this.csv.getColoumnByIndex(1);
          this.data[0].type = this.csv.getDataType();
          this.plot_channel(this.csv.getHeaderByIndex(1));
          Plotly.newPlot(this.$refs.container, this.data, this.layout)
        }
        return true;
      });
    },
    plot_channel: function(channel) {
      this.data[0].x = this.csv.getColoumnByIndex(0)
      this.data[0].y = this.csv.getColoumnByName(channel)
      this.data[0].type = this.csv.getDataType() ;
    },
    plotAsHeatmap: function(event) {
      if (event) {
        var tdata = [
          {
            z: this.csv.getAllData(),
            x: this.csv.getColoumnByIndex(0),
            y: this.csv.getHeaders(),
            type: "heatmap"
          }
        ];
        Plotly.react(this.$refs.container, tdata, this.layout)
      } else {
        this.data[0].x = this.csv.getColoumnByIndex(0);
        this.data[0].y = this.csv.getColoumnByIndex(1);
        this.data[0].type = "bar";
      }
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
        Plotly.react(this.$refs.container, tdata, this.layout)
      
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
    switchAxes: function() {
      this.csv.transposeSelf();
      this.allChannelsX = this.csv.getHeaders();
      this.allChannelsY = this.csv.getColoumnByIndex(0)
      this.data[0].x = this.csv.getColoumnByIndex(0);
      this.data[0].y = this.csv.getColoumnByIndex(1);
    },
    exportAsCSV: function() {
      this.csv.export(this.allChannelsX);
    },
    initEvents() {
      this.__generalListeners = events.map((eventName) => {
        return {
          fullName: 'plotly_' + eventName,
          handler: (...args) => {
            this.$emit.apply(this, [eventName].concat(args))
          }
        }
      })

      this.__generalListeners.forEach((obj) => {
        this.$refs.container.on(obj.fullName, obj.handler)
      })
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
      return opts
    },
    newPlot() {
      return Plotly.newPlot(this.$refs.container, this.data, this.layout, this.getOptions())
    },
    react() {
      return Plotly.react(this.$refs.container, this.data, this.layout, this.getOptions())
    },
    ...methods,
  },
  mounted() {
    this.loadURL(this.url);
    this.react()
    this.initEvents()
    this.handleResize();
    this.$watch('data', () => {
      this.internalLayout.datarevision++
      this.react()
    }, { deep: !this.watchShallow })

    this.$watch('options', this.react, { deep: !this.watchShallow })
    this.$watch('layout', this.relayout, { deep: !this.watchShallow })
    
  },
  created() {
    
  },
  destroyed() {},
  beforeDestroy() {
    this.__generalListeners.forEach(obj => this.$refs.container.removeAllListeners(obj.fullName))
    Plotly.purge(this.$refs.container)
  }
};
</script>
<style scoped>
.controls{
  padding: 40px;
  padding-bottom: 0px;
}
.title{
  width: 572px;
  height: 17px;
  font-family: HelveticaNeue;
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
</style>