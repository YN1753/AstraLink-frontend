import api from '../utils/api'
import type { ApiResponse } from '../utils/api'

// Node types
export interface Star {
  id: string
  title: string
  content_path: string
  owner_id: string
  created_at?: string
}

export interface Galaxy {
  id: string
  title: string
  color: string
  owner_id: string
  parent_id?: string
}

export interface Tag {
  id: string
  name: string
  owner_id: string
}

export interface Link {
  source_node_id: string
  target_node_id: string
  relationship_type: 'CONTAINS' | 'HAS_TAG' | 'RELATES_TO' | 'LINKED_TO'
  properties?: Record<string, any>
}

// Graph node for visualization
export interface GraphNode {
  id: string
  type: 'user' | 'galaxy' | 'star' | 'tag'
  label: string
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  vx?: number
  vy?: number
  data: User | Star | Galaxy | Tag
}

// Graph link for visualization
export interface GraphLink {
  source: string | GraphNode
  target: string | GraphNode
  type: string
  distance?: number
}

export interface User {
  id: string
  username: string
  avatar: string
}

class NodeApi {
  // Create a star (note) - optionally in a galaxy
  async createStar(galaxyId?: string): Promise<ApiResponse<Star>> {
    console.log('[NodeApi.createStar] Calling with galaxyId:', galaxyId)
    try {
      const response = await api.post<ApiResponse<Star>>('/api/star/create', galaxyId ? { galaxy_id: galaxyId } : {})
      console.log('[NodeApi.createStar] Response:', response)
      return response.data
    } catch (error: any) {
      console.error('[NodeApi.createStar] Error:', error)
      console.error('[NodeApi.createStar] Error response:', error.response)
      throw error
    }
  }

  // Create a galaxy
  async createGalaxy(parentId?: { parent_id?: string }): Promise<ApiResponse<Galaxy>> {
    console.log('[NodeApi.createGalaxy] Calling with parentId:', parentId)
    try {
      const response = await api.post<ApiResponse<Galaxy>>('/api/galaxy/create', parentId || {})
      console.log('[NodeApi.createGalaxy] Response:', response)
      return response.data
    } catch (error: any) {
      console.error('[NodeApi.createGalaxy] Error:', error)
      console.error('[NodeApi.createGalaxy] Error response:', error.response)
      throw error
    }
  }

  // Get star content
  async getStarContent(starId: string): Promise<ApiResponse<string>> {
    const response = await api.get<ApiResponse<string>>(`/api/star/${starId}/content`)
    return response.data
  }

  // Update star content
  async updateStarContent(starId: string, content: string): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(`/api/star/${starId}/content`, {
      content
    })
    return response.data
  }

  // Update star title
  async updateStarTitle(starId: string, title: string): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(`/api/star/${starId}/title`, {
      title
    })
    return response.data
  }

  // Update galaxy title
  async updateGalaxyTitle(galaxyId: string, title: string): Promise<ApiResponse<null>> {
    const response = await api.put<ApiResponse<null>>(`/api/galaxy/${galaxyId}/title`, {
      title
    })
    return response.data
  }

  // Get galaxies in a parent galaxy
  async getGalaxies(parentId?: string, limit = 20, offset = 0): Promise<ApiResponse<Galaxy[]>> {
    const response = await api.get<ApiResponse<Galaxy[]>>('/api/galaxy', {
      params: { parent_id: parentId, limit, offset }
    })
    return response.data
  }

  // Get stars in a galaxy
  async getStars(galaxyId?: string, limit = 20, offset = 0, search = '', tag = ''): Promise<ApiResponse<Star[]>> {
    const response = await api.get<ApiResponse<Star[]>>('/api/star', {
      params: { galaxy_id: galaxyId, limit, offset, search, tag }
    })
    return response.data
  }

  // Get user's graph data
  async getUserGraph(userId?: string, centerId?: string): Promise<ApiResponse<{ nodes: GraphNode[], links: GraphLink[] }>> {
    const params: Record<string, string> = {}
    if (userId) params.user_id = userId
    if (centerId) params.center_id = centerId

    console.log('[nodeApi.getUserGraph] Calling with userId:', userId, 'centerId:', centerId, 'params:', params)

    const response = await api.get<ApiResponse<{ nodes: GraphNode[], links: GraphLink[] }>>('/api/graph', { params })
    return response.data
  }

  // Create relationship between nodes
  async createRelationship(link: Link): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>('/api/relationships', link)
    return response.data
  }

  // Delete relationship
  async deleteRelationship(relationshipId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/api/relationships/${relationshipId}`)
    return response.data
  }

  // Delete node
  async deleteNode(nodeId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/api/nodes/${nodeId}`)
    return response.data
  }

  // Get tags
  async getTags(): Promise<ApiResponse<Tag[]>> {
    const response = await api.get<ApiResponse<Tag[]>>('/api/tags')
    return response.data
  }

  // Create tag
  async createTag(name: string): Promise<ApiResponse<Tag>> {
    const response = await api.post<ApiResponse<Tag>>('/api/tags', { name })
    return response.data
  }

  // Delete tag (from system, not from a node)
  async deleteTag(tagId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/api/tags/${tagId}`)
    return response.data
  }

  // Add tag to node
  async addTagToNode(nodeId: string, tagId: string): Promise<ApiResponse<null>> {
    const response = await api.post<ApiResponse<null>>(`/api/nodes/${nodeId}/tags/${tagId}`)
    return response.data
  }

  // Remove tag from node
  async removeTagFromNode(nodeId: string, tagId: string): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>(`/api/nodes/${nodeId}/tags/${tagId}`)
    return response.data
  }

  // Search
  async search(query: string, type = 'all', limit = 10): Promise<ApiResponse<any[]>> {
    const response = await api.get<ApiResponse<any[]>>('/api/search', {
      params: { q: query, type, limit }
    })
    return response.data
  }

  // Get user stats
  async getUserStats(): Promise<ApiResponse<{ galaxyCount: number; starCount: number; tagCount: number }>> {
    const response = await api.get('/api/stats')
    return response.data
  }

  // Clear all stars (notes)
  async clearAllStars(): Promise<ApiResponse<null>> {
    const response = await api.delete<ApiResponse<null>>('/api/star/clear-all')
    return response.data
  }

  // Get tags for a specific node
  async getNodeTags(nodeId: string): Promise<ApiResponse<Tag[]>> {
    console.log('[nodeApi.getNodeTags] Fetching tags for nodeId:', nodeId)
    const response = await api.get<ApiResponse<Tag[]>>(`/api/nodes/${nodeId}/tags`)
    console.log('[nodeApi.getNodeTags] Response:', response.data)
    return response.data
  }

  // Get tag categories count (distinct tag names)
  async getTagCategoriesCount(): Promise<ApiResponse<{ tagCategoriesCount: number }>> {
    const response = await api.get('/api/tags/categories/count')
    return response.data
  }
}

export const nodeApi = new NodeApi()