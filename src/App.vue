<template>
  <div id="app">
    <router-view />
  </div>
</template>

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

body {
  margin: 0px;
}

html {
  background: url('../images/background.jpg') no-repeat 0 0 scroll;
  background-color: #0c0c0c;
  background-size: 100% 100%;
  height: 1080px;
  width: 1920px;
}
</style>
