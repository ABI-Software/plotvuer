<template>
  <div class="plot-container">
    <h1>Plotl only</h1>
    <PlotVuer :title="'plotly only'" :data-source="exampleInput" :plotlyOnly="true" :plotType="'plotly-only'"></PlotVuer>
  </div>
</template>

<script>
import PlotVuer from '@/components/PlotVuer'

const input = [
  {
    x: [0, 1, 2, 3, 4, 5],
    y: [100, 10, 130, 70, 80, 90],
    type: 'scatter'
  },
  {
    x: [0, 1, 2, 3, 4, 5],
    y: [1.5, 1, 1.3, 0.7, 0.8, 0.9],
    type: 'scatter'
  },
]

export default {
  name: 'PlotlyOnly',
  components: {
    PlotVuer
  },
  data: function () {
    return {
      exampleInput: input
    }
  },

}
</script>

<style></style>
