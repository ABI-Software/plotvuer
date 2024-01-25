<template>
  <div class="container">
    <!-- <map-svg-sprite-color /> -->
    <div ref="zoomControls" :class="{inactive: !controlsEnabled}" class="bottom-right-control">
      <el-popover
        v-model="hoverVisibilities[0].value"
        content="Zoom in"
        placement="left"
        :append-to-body="false"
        trigger="manual"
        popper-class="plot-popper"
      >
        <template v-slot:reference>
          <!-- <map-svg-icon
            icon="zoomIn"
            class="icon-button zoomIn"
            @click="zoomIn()"
            @mouseover="showToolitip(0)"
            @mouseout="hideToolitip(0)"
          /> -->
        </template>
      </el-popover>
      <el-popover
        v-model="hoverVisibilities[1].value"
        content="Zoom out"
        placement="top-end"
        :append-to-body="false"
        trigger="manual"
        popper-class="plot-popper popper-zoomout"
      >
        <template v-slot:reference>
          <!-- <map-svg-icon
            icon="zoomOut"
            class="icon-button zoomOut"
            @click="zoomOut()"
            @mouseover="showToolitip(1)"
            @mouseout="hideToolitip(1)"
          /> -->
        </template>
      </el-popover>
      <!-- The commented part remains unchanged -->
      <el-popover
        v-model="hoverVisibilities[2].value"
        content="Reset"
        placement="top"
        :append-to-body="false"
        trigger="manual"
        popper-class="plot-popper"
      >
        <template v-slot:reference>
          <!-- <map-svg-icon
            icon="resetZoom"
            class="icon-button resetView"
            @click="resetView()"
            @mouseover="showToolitip(2)"
            @mouseout="hideToolitip(2)"
          /> -->
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { ElSelect, ElOption, ElCollapse, ElCollapseItem, ElButton, ElPopover } from 'element-plus';
// import { MapSvgSpriteColor, MapSvgIcon } from '@abi-software/svg-sprite';

export default {
  name: 'PlotControls',
  components: {
    // MapSvgSpriteColor,
    // MapSvgIcon,
    ElSelect,
    ElOption,
    ElCollapse,
    ElCollapseItem,
    ElButton,
    ElPopover
  },
  props: {
    parentElement: {
      type: Object,
      required: true
    },
    controlsEnabled: {
      type: Boolean,
      required: true
    }
  },
  data: function () {
    return {
      hoverVisibilities: [{value: false}, {value: false}, {value: false}, {value: false}, {value: false}],
      zoomSelect: [
        {
          value: '1',
          label: '100%'
        }
      ],
      selectZoom: '100%',
      zoom: 100,
      maxZoom: 800,
      zoomInDisabled: false,
      zoomOutDisabled: true
    }
  },
  methods: {
    // zoomIn: Find and click the plotly modebar 'zoom in'
    zoomIn: function () {
      this.zoom += 100
      this.parentElement.element.querySelector('a[data-attr="zoom"][data-val="in"]').click()
      this.setDisabledButtons(this.zoom)
      this.updateZoomSelect(this.zoom)
    },
    // zoomOut: Find and click the plotly modebar 'zoom out'
    zoomOut: function () {
      this.zoom -= 100
      this.parentElement.element.querySelector('a[data-attr="zoom"][data-val="out"]').click()
      this.setDisabledButtons(this.zoom)
      this.updateZoomSelect(this.zoom)
    },
    // setDisabledButtons(zoomLevel): Disable buttons once they hit max zoom
    setDisabledButtons(zoom) {
      if (zoom === this.maxZoom) {
        this.zoomInDisabled = true
      } else {
        this.zoomInDisabled = false
      }
      if (zoom === 0) {
        this.zoomOutDisabled = true
      } else {
        this.zoomOutDisabled = false
      }
      return
    },
    resetView: function () {
      this.zoom = 100
      this.parentElement.element.querySelector('a[data-attr="zoom"][data-val="reset"]').click()
      this.setDisabledButtons(this.zoom)
      this.updateZoomSelect(this.zoom)
    },
    percentToNum(percentage) {
      return Number(percentage.slice(0, -1))
    },
    selectZoomChange: function (requestedZoomPercentage) {
      if (requestedZoomPercentage === '100%') {
        this.resetView()
        return
      }
      let newZoom = this.percentToNum(requestedZoomPercentage)
      let zoomDiff = Math.round((newZoom - this.zoom) / 100)
      for (let i = 0; i < Math.abs(zoomDiff); i++) {
        if (zoomDiff > 0) {
          this.zoomIn()
        } else {
          this.zoomOut()
        }
      }
      this.updateZoomSelect(newZoom)
    },
    updateZoomSelect(percentage) {
      this.selectZoom = String(percentage) + '%'
    },
    createZoomPercentages: function () {
      this.zoomSelect = []
      for (let i = 0; i <= this.maxZoom / 100; i++) {
        this.zoomSelect.push({
          value: i,
          label: (i + 1) * 100 + '%'
        })
      }
    },
    setHelpMode: function (helpMode) {
      if (helpMode) {
        this.inHelp = true
        this.hoverVisibilities.forEach(item => {
          item.value = true
        })
      } else {
        this.inHelp = false
        this.hoverVisibilities.forEach(item => {
          item.value = false
        })
      }
    },
    showToolitip: function (tooltipNumber) {
      if (!this.inHelp) {
        this.hoverVisibilities[tooltipNumber].value = true
        this.tooltipWait = setTimeout(() => {
          this.hoverVisibilities[tooltipNumber].value = true
        }, 1000)
      }
    },
    hideToolitip: function (tooltipNumber) {
      if (!this.inHelp) {
        this.hoverVisibilities[tooltipNumber].value = false
        clearInterval(this.tooltipWait)
      }
    },
    handleWheel: function (event) {
      let change = Math.round(event.deltaY / 7)
      this.zoom = this.zoom - change
      this.updateZoomSelect(this.zoom)
    }
  }
}
</script>

<style scoped src="element-ui/lib/theme-chalk/index.css"></style>

<style scoped>
/* .controls {
  padding-left: 55px;
  padding-top: 5px;
  align-items: left;
  text-align: left;
} */

/* .bottom-right-control {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 3;
} */

/* @media only screen and (max-width: 48em) {
  .ui-controls {
    position: absolute;
    height: 100%;
    width: 40px;
    right: 0px;
    top: 160px;
    pointer-events: none;
    z-index: 5;
  }
} */

/* .title {
  width: 572px;
  height: 17px;
  font-family: Helvetica;
  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: normal;
  letter-spacing: normal;
  color: #606266;
  padding-top: 8px;
  padding-bottom: 8px;
} */
/* .options {
  position: absolute;
  z-index: 11000;
  height: calc(100% - 20px);
  text-align: right;
  overflow: auto;
  padding-top: 8px;
  padding-bottom: 8px;
} */

/* .channel-select {
  min-width: 220px;
  margin: 8px;
  margin-left: 0px;
  margin-right: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
}
.view-heatmap-button {
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.12);
  border: solid 1px #d8dce6;
  background-color: #8300bf;
  margin: 8px;
  margin-left: 0px;
  margin-right: 16px;

  font-size: 14px;
  font-weight: 500;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  color: white;
}
.input-div {
  display: flex;
  justify-content: space-between;
}

.icon-button {
  background-color: #ffffff;
  margin-left: 8px;
  height: 24px !important;
  width: 24px !important;
}

.icon-button:hover {
  cursor: pointer;
} */

/* .el-select-dropdown__item {
  font-family: Arial, Helvetica, sans-serif;
} */

/* .zoomSelect >>> .el-input__inner {
  padding: 0px;
  height: 24px;
  padding-left: 4px;
  width: 60px;
  margin-left: 8px;
} */

/* .zoomSelect >>> .el-select__caret {
  width: 8px;
  margin-right: 2px;
  margin-top: 2px;
} */

/* .bottom-right-control >>> .plot-popper {
  padding: 9px 10px;
  min-width: 150px;
  font-size: 12px;
  color: #fff;
  background-color: #8300bf;
} */
/* .bottom-right-control >>> .plot-popper .popper__arrow::after {
  border-left-color: #8300bf !important;
} */

/* .bottom-right-control >>> .el-select__tags-text {
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: middle;
} */
</style>
