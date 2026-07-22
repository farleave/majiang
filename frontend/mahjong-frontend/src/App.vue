<template>
  <div id="app">
    <el-container>
      <el-header>
        <div class="header-content">
          <h1>🀄 麻将计分系统</h1>
          <el-button type="text" @click="$router.push('/')">场馆列表</el-button>
        </div>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
#app {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  background: #f0f2f5;
}
.el-header {
  background: #409eff;
  color: #fff;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.header-content h1 {
  font-size: 24px;
  margin: 0;
}
.el-header .el-button {
  color: #fff;
}
.el-main {
  padding: 24px;
}
</style>