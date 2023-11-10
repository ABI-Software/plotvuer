<template>
  <div class="home">
    <h1>Test page for Plotvuer</h1>
    <button @click="$router.push('heatmap')">Show Heatmap</button>
    <button @click="$router.push('timeseries')">Show Timeseries</button>
    <button @click="$router.push('plotlyonly')">Show Plotly Only</button>
    
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>
