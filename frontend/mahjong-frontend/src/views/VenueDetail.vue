<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>
            <el-button type="text" @click="$router.push('/')">← 返回</el-button>
            {{ venue?.name || '场馆' }}
          </span>
          <span>
            <el-button type="info" @click="fetchRankings">🏆 查看排名</el-button>
            <el-button type="danger" @click="handleDeleteVenue">🗑️ 删除场馆</el-button>
            <el-button type="primary" @click="showAddMember = true">➕ 添加成员</el-button>
          </span>
        </div>
      </template>

      <!-- 成员列表 -->
      <div class="member-section">
        <h3>成员列表（{{ members.length }}人）</h3>
        <el-table :data="members" style="width:100%">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="姓名" />
          <el-table-column prop="created_at" label="加入时间" :formatter="formatDate" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" type="danger" @click="handleDeleteMember(row.id)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button type="success" size="large" @click="openCreateGame" :disabled="members.length < 3">
          创建对局
        </el-button>
        <span v-if="members.length < 3" style="color:#999;margin-left:12px;">（至少需要3名成员）</span>
      </div>

      <!-- 对局列表 -->
      <div class="game-section" style="margin-top:24px;">
        <h3>对局记录</h3>
        <el-table :data="games" style="width:100%">
          <el-table-column prop="id" label="对局ID" width="80" />
          <el-table-column label="场风" prop="wind" />
          <el-table-column label="人数" :formatter="formatPlayers" />
          <el-table-column label="创建时间" prop="created_at" :formatter="formatDate" />
          <el-table-column label="操作">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="goToGame(row.id)">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- 添加成员弹窗 -->
    <el-dialog v-model="showAddMember" title="添加成员" width="400px">
      <el-input v-model="newMemberName" placeholder="请输入成员姓名" />
      <template #footer>
        <el-button @click="showAddMember = false">取消</el-button>
        <el-button type="primary" @click="handleAddMember">确认添加</el-button>
      </template>
    </el-dialog>

    <!-- 创建对局弹窗 -->
    <el-dialog v-model="showCreateGame" title="创建对局" width="500px" @open="resetSelectedPlayers">
      <el-form label-width="100px">
        <el-form-item label="对局类型">
          <el-radio-group v-model="gameType">
            <el-radio :label="false">四人场</el-radio>
            <el-radio :label="true">三人场</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="场风">
          <el-radio-group v-model="wind">
            <el-radio label="东">东风场</el-radio>
            <el-radio label="南">南风场</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="座位选择">
          <div v-for="(seat, index) in seatLabels" :key="index" style="margin-bottom:8px;">
            <span style="display:inline-block;width:60px;">{{ seat }}</span>
            <el-select v-model="selectedPlayers[index]" placeholder="请选择成员" style="width:180px;">
              <el-option v-for="m in members" :key="m.id" :label="m.name" :value="m.id" />
            </el-select>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateGame = false">取消</el-button>
        <el-button type="primary" @click="handleCreateGame">确认创建</el-button>
      </template>
    </el-dialog>

    <!-- 排名弹窗 -->
    <el-dialog v-model="showRankings" title="成员总排名" width="500px">
      <el-table :data="rankings" style="width:100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="total_score" label="总得分" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useVenueStore } from '../stores/venue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const venueStore = useVenueStore()
    const route = useRoute()
    const router = useRouter()
    const venueId = parseInt(route.params.id)

    const showAddMember = ref(false)
    const newMemberName = ref('')
    const showCreateGame = ref(false)
    const gameType = ref(false)
    const wind = ref('东')
    const selectedPlayers = ref([])
    const showRankings = ref(false)
    const rankings = ref([])

    const venue = computed(() => venueStore.currentVenue)
    const members = computed(() => venueStore.members)
    const games = computed(() => venueStore.games)

    const seatLabels = computed(() => {
      return gameType.value ? ['东', '南', '西'] : ['东', '南', '西', '北']
    })

    const resetSelectedPlayers = () => {
      const count = gameType.value ? 3 : 4
      selectedPlayers.value = new Array(count).fill(null)
    }

    const fetchData = async () => {
      await venueStore.fetchVenueDetail(venueId)
      await venueStore.fetchMembers(venueId)
      await venueStore.fetchGames(venueId)
    }

    const handleAddMember = async () => {
      if (!newMemberName.value.trim()) {
        alert('请输入成员姓名')
        return
      }
      await venueStore.addMember(venueId, newMemberName.value)
      showAddMember.value = false
      newMemberName.value = ''
      await venueStore.fetchMembers(venueId)
    }

    const handleDeleteMember = async (memberId) => {
      if (!confirm('确定要移除该成员吗？')) return
      await venueStore.deleteMember(venueId, memberId)
      await venueStore.fetchMembers(venueId)
    }

    const handleDeleteVenue = async () => {
      if (!confirm('确定要删除该场馆及所有数据吗？此操作不可撤销！')) return
      try {
        await axios.delete(`/api/venues/${venueId}`)
        alert('场馆已删除')
        router.push('/')
      } catch (e) {
        alert(e.response?.data?.error || '删除失败')
      }
    }

    const fetchRankings = async () => {
      try {
        const res = await axios.get(`/api/venues/${venueId}/rankings`)
        rankings.value = res.data
        showRankings.value = true
      } catch (e) {
        alert(e.response?.data?.error || '获取排名失败')
      }
    }

    const handleCreateGame = async () => {
      const players = selectedPlayers.value.filter(p => p !== null && p !== undefined)
      const expected = gameType.value ? 3 : 4
      if (players.length !== expected) {
        alert(`请选择 ${expected} 名成员`)
        return
      }
      // 检查重复
      const unique = new Set(players)
      if (unique.size !== players.length) {
        alert('不能选择相同成员')
        return
      }
      try {
        const res = await venueStore.createGame(venueId, {
          player_ids: players,
          is_3player: gameType.value,
          wind: wind.value
        })
        showCreateGame.value = false
        await venueStore.fetchGames(venueId)
        router.push(`/game/${res.game_id}`)
      } catch (e) {
        alert(e.response?.data?.error || '创建对局失败')
      }
    }

    const goToGame = (id) => {
      router.push(`/game/${id}`)
    }

    const formatDate = (row, col, value) => {
      return new Date(value).toLocaleString()
    }
    const formatPlayers = (row) => {
      return row.is_3player ? '三人' : '四人'
    }

    const openCreateGame = () => {
      resetSelectedPlayers()
      showCreateGame.value = true
    }

    onMounted(fetchData)

    return {
      venue,
      members,
      games,
      showAddMember,
      newMemberName,
      showCreateGame,
      gameType,
      wind,
      selectedPlayers,
      seatLabels,
      showRankings,
      rankings,
      handleAddMember,
      handleDeleteMember,
      handleDeleteVenue,
      fetchRankings,
      handleCreateGame,
      goToGame,
      formatDate,
      formatPlayers,
      openCreateGame,
      resetSelectedPlayers
    }
  }
}
</script>

<style scoped>
.box-card {
  max-width: 1000px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.member-section,
.action-section,
.game-section {
  margin-top: 20px;
}
.action-section {
  text-align: center;
}
</style>