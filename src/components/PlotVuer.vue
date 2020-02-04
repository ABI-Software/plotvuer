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
    <vue-plotly class="chart" ref="plotly" :data="pdata" :layout="layout" :autoResize="true" />
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
import VuePlotly from "@statnett/vue-plotly";
import Vue from "vue";
import { Select, Option, Collapse, CollapseItem } from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import CsvManager from "./csv_manager";
import ReziseSensor from "css-element-queries/src/ResizeSensor";

Vue.use(Select);
Vue.use(Option);
Vue.use(Collapse);
Vue.use(CollapseItem);
export default {
  name: "PlotVuer",
  components: { VuePlotly },
  props: ["url"],
  data: function() {
    return {
      allChannels: [],
      pdata: [{ x: [], y: [], type: "scatter" }],
      layout: {
        title: "Loading csv file",
        paper_bgcolor: "rgba(0,0,0,0)",
        plot_bgcolor: "rgba(0,0,0,0)"
      },
      csv: new CsvManager(),
      channel: "Select a channel",
      collapseName: "Options",
      buttonLabels: ["Plot As Heatmap", "Export as CSV"],
      selected: []
    };
  },
  methods: {
    loadURL: function(url) {
      this.csv.loadFile(url).then(() => {
        this.pdata[0].x = this.csv.getColoumnByIndex(0);
        this.pdata[0].y = this.csv.getColoumnByIndex(1);
        this.pdata[0].type = this.csv.getDataType();
        this.allChannels = this.csv.getHeaders();
        this.plot(this.csv.getHeaderByIndex(1));
        this.layout.title = this.csv.getTitle(url)

        return true;
      });
    },
    plot: function(channel) {
      this.pdata[0].x = this.csv.getColoumnByIndex(0)
      this.pdata[0].y = this.csv.getColoumnByName(channel)
      this.pdata[0].type = this.csv.getDataType() ;
    },
    plotAsHeatmap: function(event) {
      if (event) {
        this.pdata = [
          {
            z: [[1, 20, 30], [20, 1, 60], [30, 60, 1]],
            type: "heatmap"
          }
        ];
      } else {
        this.pdata[0].x = this.csv.getColoumnByIndex(0);
        this.pdata[0].y = this.csv.getColoumnByIndex(1);
        this.pdata[0].type = "bar";
      }
    },
    handleResize: function() {
      new ReziseSensor(this.$el, () => {
        // this.layout.title =
        //   "Width now:" + this.$el.clientWidth + " Height now: " + (this.$el.parentElement.clientHeight - this.$refs.selectBox.$el.clientHeight)
        this.$refs.plotly.relayout({
          width: this.$el.clientWidth,
          height: this.$el.parentElement.clientHeight - this.$refs.selectBox.$el.clientHeight
        });
      });
    },
    switchAxes: function() {
      this.csv.transposeSelf();
      this.allChannels = this.csv.getHeaders();
      this.pdata[0].x = this.csv.getColoumnByIndex(0);
      this.pdata[0].y = this.csv.getColoumnByIndex(1);
    },
    exportAsCSV: function() {
      this.csv.export(this.allChannels);
    },
    traceEvent: function(selectList) {
      this.pdata = [];
      for (let i in selectList) {
        this.pdata.push({
          x: this.csv.getColoumnByIndex(0),
          y: this.csv.getColoumnByName(selectList[i]),
          type: this.csv.getDataType(),
          name: selectList[i]
        });
      }
    }
  },
  mounted() {
    this.handleResize();
    if (this.plotType === "heatmap") {
      this.pdata = [
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
  destroyed() {}
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