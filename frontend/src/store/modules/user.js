export default {
  namespaced: true,
  state: {
    users: [],
    currentUser: null,
    loading: false,
    error: null
  },
  getters: {
    users: state => state.users,
    currentUser: state => state.currentUser,
    loading: state => state.loading,
    error: state => state.error
  },
  mutations: {
    setUsers(state, users) {
      state.users = users
    },
    setCurrentUser(state, user) {
      state.currentUser = user
    },
    setLoading(state, status) {
      state.loading = status
    },
    setError(state, error) {
      state.error = error
    },
    addUser(state, user) {
      state.users.push(user)
    },
    updateUser(state, updatedUser) {
      const index = state.users.findIndex(user => user.id === updatedUser.id)
      if (index !== -1) {
        state.users.splice(index, 1, updatedUser)
      }
    },
    deleteUser(state, userId) {
      state.users = state.users.filter(user => user.id !== userId)
    }
  },
  actions: {
    async fetchUsers({ commit }) {
      try {
        commit('setLoading', true)
        const response = await fetch('/api/users')
        const data = await response.json()
        commit('setUsers', data)
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    async fetchUser({ commit }, id) {
      try {
        commit('setLoading', true)
        const response = await fetch(`/api/users/${id}`)
        const data = await response.json()
        commit('setCurrentUser', data)
      } catch (error) {
        commit('setError', error.message)
      } finally {
        commit('setLoading', false)
      }
    },
    async createUser({ commit }, userData) {
      try {
        commit('setLoading', true)
        const response = await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })
        const data = await response.json()
        commit('addUser', data)
        return data
      } catch (error) {
        commit('setError', error.message)
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async updateUser({ commit }, { id, userData }) {
      try {
        commit('setLoading', true)
        const response = await fetch(`/api/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        })
        const data = await response.json()
        commit('updateUser', data)
        return data
      } catch (error) {
        commit('setError', error.message)
        throw error
      } finally {
        commit('setLoading', false)
      }
    },
    async deleteUser({ commit }, id) {
      try {
        commit('setLoading', true)
        await fetch(`/api/users/${id}`, {
          method: 'DELETE'
        })
        commit('deleteUser', id)
      } catch (error) {
        commit('setError', error.message)
        throw error
      } finally {
        commit('setLoading', false)
      }
    }
  }
} 