<template>
  <div class="plot-container">
    <h1>Plot of heatmap data</h1>
    <plot-vuer :data-source="{url: urlList[4]}" :metadata="metadata" />
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
        'https://mapcore-bucket1.s3-us-west-2.amazonaws.com/ISAN/csv-data/use-case-2/Sample_1_18907001_channel_1.csv',
        'https://api.sparc.science/s3-resource/141/3/files/derivative/pool-1/RAGP_4subs_raw_Ct.csv',
        'https://prd-sparc-storage-use1.s3.amazonaws.com/599/7c3c9e1a-15a8-4d5b-ab1d-35996be5a8f5/PR1705_Negddct.csv?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQC8%2BrzQLp6rIRSPjrnbZX9ONj2j41H%2FafkjbgnlVoKrLAIhANCKSCT9sCnuHISt4PyP%2FnDkfc%2Bv4nDAjpu0Psx3LmOjKooECLL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMNzQwNDYzMzM3MTc3Igw%2Bzfu7jO5yZ4OCmvMq3gP5lrjaXlWv9gvI1FslIuHqnoMt1b1Hd0a6lLMiRgBhqUvogpNpsss3Tzt0YlTgGChfIek13lnUZlkZbs72L3lj4BbDYd0hMLEwNT1t417e7POs22TY0aVS0WuYJDV2%2FdFaA9spZxk5%2Ffg7u0FsgYQ7xJwJbszeODx0aBItNRDl41sztbK0TJq%2B%2BaH%2FCtIk4A6KUnamPLX8c3F89FK2RCNrcESe%2B6M6PjMMiqbH%2BqXepd%2F3JuFGPtzvgagb8iCLsz4KsjAUgu3Y%2BCkfqJzwJH552A2vU57BkWamBK5%2FTdBdmy%2BX9v1IVaUx16AjO3RWTt%2F9J0dugGhy6iGbZNbmxio5ufieIQ9qElsR8vEhVCS9dHGEBQQbRPXjqhZkghN1sUmcMQUcMp23ATfIpkKfnHiI8HWVgI3f9Lf1Fip3%2B9dtm3IjiNr9%2F4UK%2BgdjfsHirh%2BmvmCx8ORLApQelfR9Qk5NpuOR4tfskj%2FhriJ0yMBjgcJAo1PbfyMXDWkr5zF9SObrJlGq%2F%2FhRS9rnKEe76uOtfZ%2F%2Fj6LbIE4BhKiqHp2jBq9qxWSI1Ya20jiPscKIAuRwwuKklGnJhbT4WQS3RkT09ciG%2FpNfY9gAE0pKdVcy844e%2FlJVckvEFd%2B8IDOMMKzK1owGOqQBp15sYTEJCxdkh0GoqRjfFOj%2FD19aEC0v3z8d8DaeZPHax9brX2GWSBn0viGFN%2FKWNhVDSL9Amiuc%2FbaZqF6FR7gsVt%2F2IcPrp3ux1SSmV8UA%2B07bNK%2F0byGWYKHSRsqle4KCl4KpODcMcaimNVe%2ByWeLY%2FOrrosHhSh5xK0RNIf25CJLjRBesRmT15OD5nCHg3%2BB2wvQxE9Lt8s446iHcR%2BXq5w%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211118T024301Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIA2YZYN33M6R2SRXHO%2F20211118%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5559563b189f1c054382609b37e0f5de6e0f4068e370896b27f29b484cb468ea',
        'https://prd-sparc-storage-use1.s3.amazonaws.com/394/c1d4094e-dd76-489c-9708-b443d3f67d18/Average_per_strain.csv?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEBgaCXVzLWVhc3QtMSJGMEQCIHj5ILE%2BC%2Fl9cFsCU6UcI1Rr9QO7uv9yZc9nG%2BnmpqIgAiAws7bEG3Z8nQhF%2Bn95kmqYkSmc98a8Y%2BCSSG7DHVjfmCqKBAjh%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAEaDDc0MDQ2MzMzNzE3NyIMaO%2FMTqGX%2FqWPFAfXKt4DMF5kCl7c%2BDbWa3nW2WYkz290dXQ8ZaQISnF%2BiTFNBx0h9egqkIH34OWPoe8o0GzBG5TcY84aNut%2B6dZWrpEjFheWt2U70gpKl6E2Z4WAO6Vw1nHmmzYD18xCZ5h3gZvOxcanGM7aJkfOq%2FTAsoMjVRZFIw2ePtpovZVPOq5Y85qC6Mxygi9W2%2FVn9dQ2NPKyCPSEKV5thP%2Fdpquk9%2FQZDmYNrQERlszlW8FFUM5lXNju66aZ6ZgkqBqSbgeYsibjvIF0gVOUZ43g%2FzDdjUlNMaGfxDXdlqxbEflmpFw8M9azqqsMwebdy4ZXeamV0z5P9IsVu8r%2FYjQTs%2B9HvN3l0ZG60Xfkwa%2B%2BLRA%2B2b7n64rGuv2zHm7bmcZQXauQLkQeM8XgfqKYEFIg6g%2FRlRgu4xtUSfLArc%2BfAVkHDMnjOVQZsM0v%2FkTUWwyY7g4C827dRV%2FBWvCEe57Tnq8K888EkaEl6QgQZV5dtw3YngPcAGSiOQ07PCb%2BkrCuLfryoMuqND%2BE8BOBIV95jJVXRzXwI3Bh0nPtmsbjXnYwMuwnqxuUopgiIpJuhUaySPdi7nemsqivxHEbL04qThdIr7oG5bAJp4M%2B5sydsc6HLWbyEmkk0CPzCh%2BkalhokFY2IDCd0JWNBjqmAaq5DaCQULIDYdWvGK6ErxNi%2FdDIBPFRpQuU8e2mxGFnHUe2XjB65kMmIHR%2Bx4aRwlv9KIHVH0oDEBCLLLeWWqpUy7tSWe4iwUCNTombWMbANn8QyK6zT8aFtfwSM1bD%2B72nPIrMH6JUJ2nPyLq9rVT%2B6B4YNRlk5Zp6oYxWQ0ejBXihybpwFpXSK5urS8HbpxGKO4%2FuV79kWdOxHscZFI6ekv8L7e8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211130T003314Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIA2YZYN33MQXBHDE4J%2F20211130%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a0899e4932df4c3de4a337af53124f827e3f642109f734900452f9550e1f6156'
      ]
    }
  },
  computed: {
    metadata() {
      return {
        version: '1.2.0',
        type: 'plot',
        attrs: {style: 'heatmap', layout: {l: 200, height: '900px'}, logScale: true, columnHeaderIndex: 1, columnHeaderSize: 3}
      }
    }
  }
}
</script>

<style></style>
