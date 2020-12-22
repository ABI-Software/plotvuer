<template>
  <div id="app">
    <button @click="helpMode = !helpMode">Help Mode</button>
    <button @click="changeInput">Change input</button>

    <vue-draggable-resizable :w="500" :h="500" @dragging="onDrag" @resizing="onResize" :parent="true">
      <PlotVuer :title="'plot title'" :url="urlList[0]" :plotType="'heatmap'"></PlotVuer>
    </vue-draggable-resizable>
    <vue-draggable-resizable :w="500" :h="500" @dragging="onDrag" @resizing="onResize" :parent="true">
      <PlotVuer :title="'plot title'" :url="urlList[1]" :plotType="'scatter'"></PlotVuer>
    </vue-draggable-resizable>
    <el-input class='element' placeholder="Enter url" v-model="urlList[0]"></el-input>
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

var input = [{
        x: [0, 1, 2, 3, 4, 5], 
        y: [100, 10, 130, 70, 80, 90], 
        type: 'scatter'
      }]

export default {
  name: 'app',
  components: {
    PlotVuer,
   VueDraggableResizable 
  },
  data: function(){
    return {
      urlList: ['https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-4/RNA_Seq.csv', 'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv'],
      width: 700,
      height: 700,
      plotTypeList: ["heatmap", "barchart",],
      y: 0,
      helpMode: false,
      exampleInput: input
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