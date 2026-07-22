<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>场馆列表</span>
          <el-button type="primary" @click="showCreateDialog = true">➕ 创建场馆</el-button>
        </div>
      </template>
      <div v-if="venues.length === 0" class="empty">暂无场馆，请创建</div>
      <div class="venue-grid">
        <el-card v-for="venue in venues" :key="venue.id" class="venue-card" @click="goToVenue(venue.id)">
          <h3>{{ venue.name }}</h3>
          <span class="time">{{ formatDate(venue.created_at) }}</span>
        </el-card>
      </div>
    </el-card>

    <!-- 创建场馆弹窗 -->
    <el-dialog v-model="showCreateDialog" title="创建场馆" width="400px">
      <el-input v-model="newVenueName" placeholder="请输入场馆名称" />
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreateVenue">确认创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useVenueStore } from '../stores/venue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const venueStore = useVenueStore()
    const router = useRouter()
    const showCreateDialog = ref(false)
    const newVenueName = ref('')

    const venues = computed(() => venueStore.venues)

    const fetchVenues = async () => {
      await venueStore.fetchVenues()
    }

    const handleCreateVenue = async () => {
      if (!newVenueName.value.trim()) {
        alert('请输入场馆名称')
        return
      }
      await venueStore.createVenue(newVenueName.value)
      showCreateDialog.value = false
      newVenueName.value = ''
      await fetchVenues()
    }

    const goToVenue = (id) => {
      router.push(`/venue/${id}`)
    }

    const formatDate = (dateStr) => {
      const d = new Date(dateStr)
      return d.toLocaleString()
    }

    onMounted(fetchVenues)

    return {
      venues,
      showCreateDialog,
      newVenueName,
      handleCreateVenue,
      goToVenue,
      formatDate
    }
  }
}
</script>

<style scoped>
.box-card {
  max-width: 900px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.venue-card {
  cursor: pointer;
  transition: 0.3s;
}
.venue-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.1);
}
.venue-card h3 {
  margin: 0 0 8px 0;
}
.time {
  font-size: 12px;
  color: #999;
}
.empty {
  text-align: center;
  color: #999;
  padding: 30px 0;
}
</style>