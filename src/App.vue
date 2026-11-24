<template>
  <div id="app">
    <div v-if="$route.name !== 'Home'" class="help-mode-buttons">
      <button @click="startHelpTour">Help Tour</button>
      <button @click="startHelpHover">Hover Help</button>
    </div>
    <router-view />
    <HelpModeTour v-model="helpTourOpen" :steps="helpSteps" />
    <HelpModeHover v-model="helpHoverOpen" :steps="helpSteps" />
  </div>
</template>

<script>
import { collectHelpModeSteps, HelpModeHover, HelpModeTour } from '@abi-software/map-utilities';
import '@abi-software/map-utilities/dist/style.css';

export default {
  name: 'App',
  components: {
    HelpModeTour,
    HelpModeHover,
  },
  data: function () {
    return {
      helpSteps: [],
      helpTourOpen: false,
      helpHoverOpen: false,
    };
  },
  methods: {
    // The test pages show one or more plots, collect the steps of the whole page
    getHelpSteps: function () {
      return collectHelpModeSteps(this.$el);
    },
    startHelpTour: function () {
      this.helpSteps = this.getHelpSteps();
      this.helpTourOpen = true;
    },
    startHelpHover: function () {
      this.helpSteps = this.getHelpSteps();
      this.helpHoverOpen = true;
    },
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  position: absolute;
}
.help-mode-buttons {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  display: flex;
  gap: 4px;
}
.url-input {
  width: 250px;
}

html,
body {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body {
  margin: 0px;
}

html {
  background: url('../images/background.jpg') no-repeat 0 0 scroll;
  background-color: #0c0c0c;
  background-size: cover;
}
</style>
