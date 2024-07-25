<template>
  <Vue3DraggableResizable
    :initW="410"
    :initH="420"
    :draggable="true"
    :resizable="true"
  >
    <div class="plot-container">
      <h1>Plot of timeseries data</h1>
      <plot-vuer :data-source="{url: urlList[1]}" :metadata="metadata" :supplemental-data="[{url: urlList[4]}]" :selectorUi="true" :plotLayout="plotLayout" />
    </div>
  </Vue3DraggableResizable>
</template>

<script>
import PlotVuer from '@/components/PlotVuer.vue'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
//default styles
import 'vue3-draggable-resizable/dist/Vue3DraggableResizable.css'


export default {
  name: 'Timeseries',
  components: {
    Vue3DraggableResizable,
    PlotVuer
  },
  data: function () {
    return {
      urlList: [
        'https://api.sparc.science/s3-resource/142/files/primary/sub-10/sam-1-10/pressure-preconditioning.csv?s3BucketName=prd-sparc-discover50-use1',
        'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv',
        'https://api.sparc.science/s3-resource/141/2/files/derivative/sub-1/sam-1/subject1_header.txt',
      ],
      directDataInput: {'data': [
        {
          x: [0, 1, 2, 3, 4, 5],
          y: [100, 10, 130, 70, 80, 90],
          type: 'scatter'
        }
      ]},
      plotLayout: {
        margin: {
          t: 80,
          l: 80,
          r: 80,
          b: 80,
          pad: 4
        }
      }
    }
  },
  computed: {
    metadata() {
      return {
        version: '1.1.0',
        type: 'plot',
        attrs: {
          'x-axis-column': 2,
          style: 'timeseries',
          'y-axes-columns': [3, 4, 5, 6, 7, 8, 9, 10],
          'plot-layout': {
            height: '700px',
            margin: {
              t: 35,
              l: 85,
              r: 55,
              b: 190,
              pad: 4
            }
          }
        }
      }
    }
  }
}
</script>

<style>
.plot-container {
  width: 100%;
  height: 100%;
}
</style>
