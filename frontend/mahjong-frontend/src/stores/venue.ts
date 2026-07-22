import { defineStore } from 'pinia'
import axios from 'axios'

export const useVenueStore = defineStore('venue', {
  state: () => ({
    venues: [],
    currentVenue: null,
    members: [],
    games: []
  }),
  actions: {
    async fetchVenues() {
      const res = await axios.get('/api/venues')
      this.venues = res.data
    },
    async createVenue(name) {
      const res = await axios.post('/api/venues', { name })
      return res.data
    },
    async fetchVenueDetail(id) {
      const res = await axios.get(`/api/venues/${id}`)
      this.currentVenue = res.data
    },
    async fetchMembers(venueId) {
      const res = await axios.get(`/api/venues/${venueId}/members`)
      this.members = res.data
    },
    async addMember(venueId, name) {
      const res = await axios.post(`/api/venues/${venueId}/members`, { name })
      return res.data
    },
    async deleteMember(venueId, memberId) {
      await axios.delete(`/api/venues/${venueId}/members/${memberId}`)
    },
    async fetchGames(venueId) {
      const res = await axios.get(`/api/venues/${venueId}/games`)
      this.games = res.data
    },
    async createGame(venueId, payload) {
      const res = await axios.post(`/api/venues/${venueId}/games`, payload)
      return res.data
    }
  }
})