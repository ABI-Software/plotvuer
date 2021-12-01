<template>
  <div class="plot-container">
    <h1>Plot of timeseries data</h1>
    <plot-vuer :data-source="{url: urlList[0]}" :metadata="metadata" :supplemental-data="[{url: urlList[1]}]" />
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
        'https://api.sparc.science/s3-resource/141/2/files/derivative/sub-1/sam-1/subject1_header.txt',
        'https://prd-sparc-storage-use1.s3.amazonaws.com/221/842093dd-1f69-4554-9d12-8042c326e008/stretch-pressure-twist.csv?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQCvsrt%2BzFcV5vc0RV09ABosz1uE%2BYKIkXwsue6G%2Fbag1gIhAM7glUVWj%2FVyMFmzZAouIjJ8MEU0yTujfoc1iPq1Gf8tKoEECFEQARoMNzQwNDYzMzM3MTc3Igygp0ffnqlCDtwLcKYq3gOEff9wmLVvJnHEI2TAEUSOn3Z663RWe2JDOqkIsNlN1GcU0KaHqTzuJLxK8vutS26H4PZ0Af7ogYUKaOE8RQ4ib0IkXysqRvqKSV05N7p5LjgBLK6mahdQotbkO4wLFuaU1oAtnmpDzZ6sdZ%2FB4Z8SYXBKxOzjtEX1h4iIAFH9PQaa4SYewwW1GqrJRefc%2FRnmNdGrTSTRAvZLph9ANEfC7p%2FcbD4SJyYEt0BMkiBSST%2B9gW1gncGxhBO6Mw2HP6OgsFuSGsdIDO6oLE0qXLg2v7Oxw68sBvvfX50wP2OpzbTWWv4jOYq1YvXf8CX%2FXctCwVD%2BcN0ph7lsdUEIX1tZuZAapJvNZy%2Bpbv2FqzlnyZSs9W3S8sy5KX0xDvJkXnQR5n8O1jykOXuZ%2BFYeZZ5G0rKN5EDxMrQwH0XZYstfZ9H8oVpbRHHqwct%2FvGt4RwAqtF1C69qjABMAgt4FT%2FuTp8CYkmlS%2FyI7cF3daWwCUqWgPK3pYfCLyOV6TUGWz%2BinqmtlDQBK39Ao4qzFssAq6MSfMA5nCrdsiL44sBq9%2FpfJd7%2BjtIUu0ogudqBAcYCCfaqxKRk5%2BSgBoGIrNgz5Xi0Y%2FPN6aA5MTpH6XvAV6SWWvhWSSu8c0CL9JXelMMOF9owGOqQBFDAFu8OVHAanSj2nRlIYw%2FbPTGTttMpNghgnpB5emY9oeziSq0ARmn4008UKfxsdyuyEUI0wanOh466I8cfanf8K3HjalGB%2BCai0mK1Vo2T8mcqOQ779SBUQB3i0VNDUSUa0GicVOoOkB9rF7ejBmZ5Qb39tnS%2Bl1SSo5vq7gPg2mP6t8t1VF9Fsj4MeLZu9%2BtiVVLeN3GfOV6Mmq6aVZiGDQQw%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211124T021127Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIA2YZYN33M42T2RCUI%2F20211124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=5a390184fb4c68bb25d2d8b423b8e3954a571cfb90f216eafe125526d8a92a27',
        'https://prd-sparc-storage-use1.s3.amazonaws.com/1121/43caef83-3380-4db4-a7a7-ee3c419d7b35/stretch-pressure-twist_header_file.csv?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEIf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJHMEUCIHJuuggQfSU4j3Lw%2B%2FhT9lEgXZ4jrdjZaKD8%2F1Uy6xgCAiEAo10kD7%2FpWnQZiohQKbJpYVaWfGMq3WctzD%2Bo%2B7MjDfwqgQQIUBABGgw3NDA0NjMzMzcxNzciDHGAo8diRmdZDIw4BSreA0AAtskrtAw%2FqqUcW5lnje0%2BwVEOrnF4Pw4WGlX08g3HHK2TZkVKFlQ0JbUhFbaju61TxUV2AsL2CWM827RYosT3O9e5Y1N2zTobmEKHb%2FcfVmAiWo1HjsVgIm7X7tLdLClXM0m%2BJAz9VI1Jq8DGBSBBbVAlAF6%2BOH1l9M9ed2KprzFN995XDcWitjGtEFvsRWxFXY5VodNEEiHCZUss2l5vLzA7KgF4GaxLGLeBaxFgRRQmHVcY%2FW377CQddOfOaAb4SqtFZwlt5gaWNBKLVnwHvRWN4Iwc0okQ86bwtU3nqlZfJlr8cDbPyDsLfwci4H9VUaxijAk4HwPC86lICpk0aZdL5fH8XY8SuVNJd71n%2FP%2BJn0soXUNViZ78UNU8x5R0ZHYLmj73Y37oIh%2F4OUBqNfuijGQ9dsa2gZB4rEX51hcAr6pw8ONMTKSNjamVGqVrBbslUyH0Crj7NbICqXhkdavtyp28htVQRk5CYFyePsxprHQRzx2UZkXpnrIC8AV%2BVMprwljrYAnysHWkjohz6WLBSYw4DDQJghFnmkBJjjPzDiEPXAbtspiHstbuGhAXDKxJok3F6F%2BIbA0sEvwxyqKyuZUjS8Y%2B4Q2%2Fu0Pu78sHrw12naOvGPqYVTEwi%2BD1jAY6pQEyuRjn7FjyF0YESBc1CfOKaGKhphtupTl45UfygeSByng1s8v%2BSiFsKCnua0UaLKYZGu8ofHC%2BkVkSCa5MRF%2FuZVBkxt3nasQLjdk2L17Pc39nRrwtD3sf40Mf0E1YyYOm0ifEQCTMrIh4VXfnUJGj2bZIpehprHUPyu3GUS1RsditqtRuUrPxnvEpXzsChEH1UhxbUoBY8rOAnEt6T9xw%2F0EgPe4%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20211124T021049Z&X-Amz-SignedHeaders=host&X-Amz-Expires=21600&X-Amz-Credential=ASIA2YZYN33MQZ4BJ7K5%2F20211124%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=a36376d548013588f95018ed8b6e89c9e4ca5be261daa545690637a88984c3c7'
      ]
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

<style></style>
