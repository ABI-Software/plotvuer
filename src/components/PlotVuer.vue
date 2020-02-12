<template>
  <div class="plotvuer_parent" :title="collapseName">
    <div class="options">
      <el-collapse >
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
    </div>
    <div ref="container" class="vue-plotly"/>
    <el-select
      class="channel-select"
      ref="selectBox"
      v-model="channel"
      @change="traceEvent($event)"
      multiple
      filterable
      default-first-option
      placeholder="Add and remove data to the plot"
    >
      <el-option v-for="item in allChannels" :key="item" :label="item" :value="item"></el-option>
    </el-select>
  </div>
</template>
<script>
import Plotly from './custom-plotly'
import Vue from "vue";
import { Select, Option, Collapse, CollapseItem } from "element-ui";
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
export default {
  name: "PlotVuer",
  props: ["url"],
  data: function() {
    return {
      allChannels: [],
      data: [{ x: [], y: [], type: "scatter" }],
      layout: {
        title: "Loading csv file",
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
      },
      options: {
        type: Object
      },
      watchShallow: false,
      csv: new CsvManager(),
      channel: "Select a channel",
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
        this.data[0].x = this.csv.getColoumnByIndex(0);
        this.data[0].y = this.csv.getColoumnByIndex(1);
        this.data[0].type = this.csv.getDataType();
        this.allChannels = this.csv.getHeaders();
        // this.plot_channel(this.csv.getHeaderByIndex(1));
        this.layout.title = this.csv.getTitle(url)
        Plotly.newPlot(this.$refs.container, this.data, this.layout)
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
            type: "heatmap"
          }
        ];
        let tlayout = {
          title: this.csv.getTitle(),
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)"
        }
        Plotly.react(this.$refs.container, tdata, tlayout)
      } else {
        this.data[0].x = this.csv.getColoumnByIndex(0);
        this.data[0].y = this.csv.getColoumnByIndex(1);
        this.data[0].type = "bar";
      }
    },
    handleResize: function() {
      new ReziseSensor(this.$el, () => {
        // this.layout.title =
        //   "Width now:" + this.$el.clientWidth + " Height now: " + (this.$el.parentElement.clientHeight - this.$refs.selectBox.$el.clientHeight)
        Plotly.relayout(this.$refs.container, {
          width: this.$el.clientWidth,
          height: this.$el.parentElement.clientHeight - this.$refs.selectBox.$el.clientHeight
        });
      });
    },
    switchAxes: function() {
      this.csv.transposeSelf();
      this.allChannels = this.csv.getHeaders();
      this.data[0].x = this.csv.getColoumnByIndex(0);
      this.data[0].y = this.csv.getColoumnByIndex(1);
    },
    exportAsCSV: function() {
      this.csv.export(this.allChannels);
    },
    traceEvent: function(selectList) {
      this.data = [];
      for (let i in selectList) {
        this.data.push({
          x: this.csv.getColoumnByIndex(0),
          y: this.csv.getColoumnByName(selectList[i]),
          type: this.csv.getDataType(),
          name: selectList[i]
        });
      }
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
    this.react()
    this.initEvents()
    this.handleResize();
    this.$watch('data', () => {
      this.internalLayout.datarevision++
      this.react()
    }, { deep: !this.watchShallow })

    this.$watch('options', this.react, { deep: !this.watchShallow })
    this.$watch('layout', this.relayout, { deep: !this.watchShallow })
    if (this.plotType === "heatmap") {
      this.data = [
        {
          z: this.csv.getAllData(),
          type: "heatmap"
        }
      ];
    }
  },
  created() {
    this.loadURL(this.url);
  },
  destroyed() {},
  beforeDestroy() {
    this.__generalListeners.forEach(obj => this.$refs.container.removeAllListeners(obj.fullName))
    Plotly.purge(this.$refs.container)
  }
};
</script>
<style scoped>
.options {
  position: absolute;
  z-index: 11000;
  height: calc(100% - 20px);
  text-align: left;
  overflow: auto;
}
.channel-select {
  width: 50%;
  min-width: 250px;
}
.input-div {
  display: flex;
  justify-content: space-between;
}
</style>