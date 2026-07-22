<template>
  <div>
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span><el-button type="text" @click="$router.push(`/venue/${game?.venue_id}`)">← 返回场馆</el-button> 对局 #{{ game?.id }}</span>
          <el-tag :type="game?.is_finished ? 'success' : 'warning'">
            {{ game?.is_finished ? '已结束' : '进行中' }}
          </el-tag>
        </div>
      </template>

      <!-- 对局信息 -->
      <div class="game-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="场风">{{ game?.wind }}</el-descriptions-item>
          <el-descriptions-item label="人数">{{ game?.is_3player ? '三人' : '四人' }}</el-descriptions-item>
          <el-descriptions-item label="当前局数">{{ status?.current_round || 0 }}</el-descriptions-item>
          <el-descriptions-item label="公共池">{{ status?.public_pool || 0 }} 点</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 玩家得分 -->
      <div class="player-scores">
        <h3>当前得分</h3>
        <el-row :gutter="16">
          <el-col :span="6" v-for="(p, idx) in players" :key="p.id">
            <el-card class="player-card" :style="{'border-color': idx === status?.dealer_index ? '#f56c6c' : '#dcdfe6'}">
              <div class="player-name">{{ p.name || `玩家${idx+1}` }}</div>
              <div class="player-score">{{ p.score }}</div>
              <div v-if="idx === status?.dealer_index" class="dealer-tag">庄</div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 操作按钮 -->
      <div class="actions" v-if="!game?.is_finished">
        <el-button type="primary" size="large" @click="showRoundDialog = true">📝 记录小局</el-button>
        <el-button type="info" size="large" @click="refreshStatus">🔄 刷新状态</el-button>
      </div>

      <!-- 小局记录表单弹窗 -->
      <el-dialog v-model="showRoundDialog" title="记录小局" width="700px" :close-on-click-modal="false">
        <el-form label-width="120px">
          <el-form-item label="结果类型">
            <el-radio-group v-model="roundType">
              <el-radio label="win">胡牌</el-radio>
              <el-radio label="ryukyoku">流局</el-radio>
            </el-radio-group>
          </el-form-item>
          <template v-if="roundType === 'win'">
            <el-form-item label="胡牌玩家">
              <el-select v-model="winnerId" placeholder="选择胡牌玩家">
                <el-option v-for="p in players" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="胡牌方式">
              <el-radio-group v-model="isTsumo">
                <el-radio :label="true">自摸</el-radio>
                <el-radio :label="false">荣和</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="!isTsumo" label="放铳玩家">
              <el-select v-model="ronPlayerId" placeholder="选择放铳玩家">
                <el-option v-for="p in players" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="番数">
              <el-input-number v-model="han" :min="1" :max="13" />
            </el-form-item>
            <el-form-item label="符数">
              <el-input-number v-model="fu" :min="20" :max="110" step="10" />
            </el-form-item>
            <el-form-item label="立直玩家">
              <el-select v-model="riichiPlayers" multiple placeholder="选择立直玩家（可选）">
                <el-option v-for="p in players" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
          </template>
          <template v-else>
            <el-form-item label="听牌玩家（流局）">
              <el-select v-model="tenpaiPlayers" multiple placeholder="选择听牌玩家">
                <el-option v-for="p in players" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="立直玩家">
              <el-select v-model="riichiPlayers" multiple placeholder="选择立直玩家（可选）">
                <el-option v-for="p in players" :key="p.id" :label="p.name" :value="p.id" />
              </el-select>
            </el-form-item>
          </template>
        </el-form>
        <template #footer>
          <el-button @click="showRoundDialog = false">取消</el-button>
          <el-button type="primary" @click="submitRound">确认记录</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

export default {
  setup() {
    const route = useRoute()
    const gameId = parseInt(route.params.id)
    const game = ref(null)
    const status = ref(null)
    const players = ref([])
    const showRoundDialog = ref(false)

    // 小局表单
    const roundType = ref('win')
    const winnerId = ref(null)
    const isTsumo = ref(true)
    const ronPlayerId = ref(null)
    const han = ref(1)
    const fu = ref(30)
    const riichiPlayers = ref([])
    const tenpaiPlayers = ref([])

    const fetchGameDetail = async () => {
      const res = await axios.get(`/api/games/${gameId}`)
      game.value = res.data
      // 构建玩家列表
      players.value = [
        { id: game.value.player1_id, name: game.value.player1_name, score: game.value.player1_score },
        { id: game.value.player2_id, name: game.value.player2_name, score: game.value.player2_score },
        { id: game.value.player3_id, name: game.value.player3_name, score: game.value.player3_score },
      ]
      if (!game.value.is_3player) {
        players.value.push({
          id: game.value.player4_id,
          name: game.value.player4_name,
          score: game.value.player4_score
        })
      }
    }

    const fetchStatus = async () => {
      const res = await axios.get(`/api/games/${gameId}/status`)
      status.value = res.data
      // 更新分数
      if (status.value.players) {
        status.value.players.forEach(p => {
          const player = players.value.find(p2 => p2.id === p.id)
          if (player) player.score = p.score
        })
      }
    }

    const refreshStatus = () => {
      fetchStatus()
    }

    const submitRound = async () => {
      const payload = {
        winner_id: roundType.value === 'win' ? winnerId.value : null,
        is_tsumo: isTsumo.value,
        han: han.value,
        fu: fu.value,
        ron_player_id: ronPlayerId.value,
        riichi_player_ids: riichiPlayers.value,
        tenpai_player_ids: tenpaiPlayers.value,
        is_ryukyoku: roundType.value === 'ryukyoku'
      }
      try {
        await axios.post(`/api/games/${gameId}/rounds`, payload)
        alert('记录成功！')
        showRoundDialog.value = false
        // 重置表单
        winnerId.value = null
        ronPlayerId.value = null
        han.value = 1
        fu.value = 30
        riichiPlayers.value = []
        tenpaiPlayers.value = []
        await fetchStatus()
      } catch (e) {
        alert(e.response?.data?.error || '记录失败')
      }
    }

    onMounted(async () => {
      await fetchGameDetail()
      await fetchStatus()
    })

    return {
      game,
      status,
      players,
      showRoundDialog,
      roundType,
      winnerId,
      isTsumo,
      ronPlayerId,
      han,
      fu,
      riichiPlayers,
      tenpaiPlayers,
      refreshStatus,
      submitRound
    }
  }
}
</script>

<style scoped>
.box-card {
  max-width: 1000px;
  margin: 0 auto;
}
.player-card {
  text-align: center;
  padding: 12px 0;
}
.player-name {
  font-size: 16px;
  font-weight: bold;
}
.player-score {
  font-size: 24px;
  color: #409eff;
  margin: 8px 0;
}
.dealer-tag {
  display: inline-block;
  background: #f56c6c;
  color: #fff;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 12px;
}
.actions {
  text-align: center;
  margin-top: 20px;
}
</style>