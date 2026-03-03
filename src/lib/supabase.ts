import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 类型定义
export interface User {
  id: string
  email: string
  nickname: string
  created_at: string
}

export interface Game {
  id: string
  user_id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'archived'
  created_at: string
}

export interface Character {
  id: string
  game_id: string
  name: string
  description: string
  personality: string
  appearance: string
  clothing: string
  created_at: string
}

export interface Plot {
  id: string
  game_id: string
  title: string
  content: string
  route_type: string
  branch_options: Record<string, unknown> | null
  created_at: string
}

export interface Comment {
  id: string
  game_id: string
  user_id: string
  content: string
  rating: number
  sentiment: 'positive' | 'neutral' | 'negative'
  created_at: string
}

export interface Analytics {
  id: string
  game_id: string
  metrics: string
  value: number
  date: string
  created_at: string
}

// CRUD 操作示例
export const dbOperations = {
  // Users
  async createUser(user: Omit<User, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteUser(id: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Games
  async createGame(game: Omit<Game, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('games')
      .insert([game])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getGamesByUserId(userId: string) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getGameWithDetails(gameId: string) {
    const { data, error } = await supabase
      .from('games')
      .select(`
        *,
        characters (*),
        plots (*),
        comments (*),
        analytics (*)
      `)
      .eq('id', gameId)
      .single()
    
    if (error) throw error
    return data
  },

  async updateGame(id: string, updates: Partial<Game>) {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteGame(id: string) {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Characters
  async createCharacter(character: Omit<Character, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('characters')
      .insert([character])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getCharactersByGameId(gameId: string) {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('game_id', gameId)
      .order('name', { ascending: true })
    
    if (error) throw error
    return data
  },

  async updateCharacter(id: string, updates: Partial<Character>) {
    const { data, error } = await supabase
      .from('characters')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteCharacter(id: string) {
    const { error } = await supabase
      .from('characters')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Plots
  async createPlot(plot: Omit<Plot, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('plots')
      .insert([plot])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getPlotsByGameId(gameId: string) {
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  async updatePlot(id: string, updates: Partial<Plot>) {
    const { data, error } = await supabase
      .from('plots')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deletePlot(id: string) {
    const { error } = await supabase
      .from('plots')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Comments
  async createComment(comment: Omit<Comment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getCommentsByGameId(gameId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (nickname, email)
      `)
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateComment(id: string, updates: Partial<Comment>) {
    const { data, error } = await supabase
      .from('comments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteComment(id: string) {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  // Analytics
  async createAnalytics(analytic: Omit<Analytics, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('analytics')
      .insert([analytic])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getAnalyticsByGameId(gameId: string, startDate?: string, endDate?: string) {
    let query = supabase
      .from('analytics')
      .select('*')
      .eq('game_id', gameId)
    
    if (startDate) {
      query = query.gte('date', startDate)
    }
    
    if (endDate) {
      query = query.lte('date', endDate)
    }
    
    const { data, error } = await query.order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  async updateAnalytics(id: string, updates: Partial<Analytics>) {
    const { data, error } = await supabase
      .from('analytics')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteAnalytics(id: string) {
    const { error } = await supabase
      .from('analytics')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  }
}
