# PlotVuer Live Demo

## Live Demo

<div class="demo-map-container">
  <div class="demo-map-container-inner">
    <ClientOnly>
      <plot-vuer
        :data-source="{url: url}"
        :metadata="metadata"
      />
    </ClientOnly>
  </div>
</div>

<script setup>
import { defineClientComponent } from 'vitepress'
import './demo-styles.css'

const PlotVuer = defineClientComponent(() => {
  return import('../src/components/PlotVuer.vue')
})
</script>

<script>
export default {
  data: function() {
    return {
      url: 'https://api.sparc.science//s3-resource/139/files/derivative/Differential_expression/Differential_expression_WistarVsSHR.csv?s3BucketName=prd-sparc-discover50-use1'
    };
  },
  computed: {
    metadata() {
      return {
        version: '1.2.0',
        type: 'plot',
        attrs: {
          style: 'heatmap',
          layout: {
            l: 200,
            height: '900px',
            title: 'Title'
          },
          logScale: true,
          columnHeaderIndex: 1,
          columnHeaderSize: 3
        }
      }
    }
  }
}
</script>

## Code Preview

```js-vue
  <div class="your-outer-container">
    <plot-vuer
      :data-source="{url: url}"
      :metadata="metadata"
    />
  </div>

  <script>
    import { PlotVuer } from '@abi-software/plotvuer';

    export default {
      components: { PlotVuer },
      data: function () {
        return {
          url: 'the-data-url',
          metadata: {
            version: '1.2.0',
            type: 'plot',
            attrs: {
              style: 'heatmap',
              layout: {
                l: 200,
                height: '900px',
                title: 'Title'
              },
              logScale: true,
              columnHeaderIndex: 1,
              columnHeaderSize: 3
            }
          },
        }
      }
    }
  </script>
```
