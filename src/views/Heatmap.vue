<template>
  <div class="plot-container">
    <h1>Plot of heatmap data</h1>
    <plot-vuer :data-source="{url: urlList[0]}" :metadata="metadata" />
  </div>
</template>

<script>
import PlotVuer from '@/components/PlotVuer'

export default {
  name: 'Heatmap',
  components: {
    PlotVuer
  },
  data: function () {
    return {
      urlList: [
        'https://api.sparc.science/s3-resource/29/6/files/derivative/HB-ICN-NegDDCT-data.csv',
        'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv'
      ]
    }
  },
  computed: {
    metadata() {
      return {version: '1.2.0', type: 'plot', attrs: {style: 'heatmap', columnHeaderIndex: 1, columnHeaderSize: 3}}
    }
  }
}
</script>

<style></style>
