<template>
  <div class="plot-container">
    <h1>Plot of timeseries data</h1>
    <plot-vuer :data-source="{url: urlList[0]}" :metadata="metadata" :supplemental-data="[{url: urlList[2]}]" />
  </div>
</template>

<script>
import PlotVuer from '@/components/PlotVuer'

export default {
  name: 'Timeseries',
  components: {
    PlotVuer
  },
  data: function () {
    return {
      urlList: [
        'https://api.sparc.science/s3-resource/141/2/files/primary/sub-1/sam-1/subject1.txt',
        'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv',
        'https://api.sparc.science/s3-resource/141/2/files/derivative/sub-1/sam-1/subject1_header.txt'
      ]
    }
  },
  computed: {
    metadata() {
      return {
        version: '1.1.0',
        type: 'plot',
        attrs: {
          style: 'timeseries',
          delimiter: 'tab',
          'y-axes-columns': [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          'no-header': true
        }
      }
    }
  }
}
</script>

<style></style>
