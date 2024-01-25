import PlotControls from '@/components/PlotControls'

export default {
  components: {PlotControls},
  props: {
    metadata: {
      type: Object,
      required: true
    },
    sourceData: {
      type: Object,
      required: true
    },
    plotLayout: {
      type: Object,
      required: true
    },
    supplementalData: {
      type: Array,
      required: true
    },
    version: {
      type: String,
      required: true
    }
  },
  data: function () {
    return {
      layout: {
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)'
        // margin: {
        //   t: 5,
        //   l: 55,
        //   r: 55,
        //   b: 90,
        //   pad: 4
        // }
      },
      loading: false,
      options: {
        responsive: true,
        scrollZoom: true
      }
    }
  },
  computed: {
    title() {
      const filename = this.sourceData.url.split('\\').pop().split('/').pop()
      return filename.split('.')[0]
    }
  }
}
