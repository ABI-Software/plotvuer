<template>
  <div id="app">
    <button @click="helpMode = !helpMode">Help Mode</button>
    <button @click="changeInput">Change input</button>
    <el-button @click="changeInput">Change data</el-button>
    <el-button @click="layout1 = layout2">Change layout</el-button>
    <el-input class='url-input' placeholder="Enter url" v-model="urlList[0]"></el-input>
    <div style="height: 400px; width: 400px; overflow: none; position: absolute">
      <PlotVuer :title="'plot title'" :url="urlList[0]" :layout-input="layout1" :plotType="'heatmap'"></PlotVuer>
    </div>
    <vue-draggable-resizable :w="500" :h="500" @dragging="onDrag" @resizing="onResize" :parent="true">
      <PlotVuer :title="'plotly only'" :data-input="exampleInput" :layout-input="layout1" :plotType="'plotly-only'"></PlotVuer>
    </vue-draggable-resizable>
    <div class='plot-container' style="height: 800px; width: 800px;">
    </div>
    
  </div>
</template>
  

<script>
import Input from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import Vue from 'vue'
import VueDraggableResizable from 'vue-draggable-resizable'

// optionally import default styles
import 'vue-draggable-resizable/dist/VueDraggableResizable.css'
Vue.component('vue-draggable-resizable', VueDraggableResizable)
Vue.use(Input);
import PlotVuer from './components/PlotVuer'

let input = [{
  x: [0, 1, 2, 3, 4, 5], 
  y: [100, 10, 130, 70, 80, 90], 
  type: 'scatter'
}]
  
// example of how to proide a layout to the plot  
let layout1 = {
  xaxis: {
    title: {
      text: 'layout1',
    },
  },
  yaxis: {
    title: {
      text: 'layout1'
    }
  }
};

// example of how to proide a layout to the plot  
let layout2 = {
  xaxis: {
    title: {
      text: 'layout2',
    },
  },
  yaxis: {
    title: {
      text: 'layout2'
    }
  }
};




export default {
  name: 'app',
  components: {
    PlotVuer,
   VueDraggableResizable 
  },
  data: function(){
    return {
      urlList: ['https://api.sparc.science/s3-resource/29/6/files/derivative/HB-ICN-NegDDCT-data.csv', 'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv'],
      width: 700,
      height: 700,
      plotTypeList: ["heatmap", "barchart",],
      y: 0,
      helpMode: false,
      exampleInput: input,
      layout1: layout1,
      layout2: layout2
    }
  },
    methods: {
    changeInput: function(){
      this.exampleInput = [{
        x: [0, 1, 2, 3, 4, 5], 
        y: [1.5, 1, 1.3, 0.7, 0.8, 0.9], 
        type: 'scatter'
      }]
    },
    onResize: function (x, y, width, height) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    },
    onDrag: function (x, y) {
      this.x = x
      this.y = y
    }
    }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height:100%;
  width: 100%;
  position:absolute;
}
.url-input {
  width: 250px;
}

body {
  margin: 0px;
}
html{
    background: url('../images/background.jpg') no-repeat 0 0 scroll;
    background-color:#0C0C0C;
    background-size: 100% 100%;
    height:1080px;
    width:1920px;
}
</style>