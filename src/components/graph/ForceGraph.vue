<template>
  <div ref="containerRef" class="force-graph-container">
    <canvas ref="canvasRef" class="starfield-canvas"></canvas>
    <svg ref="svgRef" class="graph-svg"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, toRaw } from 'vue'
import * as d3 from 'd3'
import type { GraphNode, GraphLink } from '../../api/node'

interface Props {
  nodes: GraphNode[]
  links: GraphLink[]
  width?: number
  height?: number
  centerNodeId?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600,
  centerNodeId: ''
})

const emit = defineEmits<{
  nodeClick: [node: GraphNode]
  nodeDoubleClick: [node: GraphNode]
  nodeDrag: [node: GraphNode, x: number, y: number]
  nodeContextMenu: [node: GraphNode, event: MouseEvent]
}>()

const containerRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const svgRef = ref<SVGSVGElement>()

// 节点主题颜色配置
const themes: Record<string, { hex: string; dim: string }> = {
  user: { hex: '#00E5FF', dim: 'rgba(0, 229, 255, 0.4)' },
  galaxy: { hex: '#FDBA74', dim: 'rgba(253, 186, 116, 0.4)' },
  star: { hex: '#14B8A6', dim: 'rgba(20, 184, 166, 0.4)' },
  tag: { hex: '#94A3B8', dim: 'rgba(148, 163, 184, 0.4)' },
  core: { hex: '#A855F7', dim: 'rgba(168, 85, 247, 0.4)' }
}

let simulation: any
let zoomBehavior: any
let localNodes: any[] = []
let localLinks: any[] = []
let linkSelection: any
let nodeSelection: any
let isDragging = false
let dragStartPos = { x: 0, y: 0 }
const DRAG_THRESHOLD = 5 // pixels to move before considered a drag

// ==========================================
// Canvas 星空背景动画
// ==========================================
let stars: Array<{ x: number; y: number; radius: number; alpha: number; speed: number }> = []
let animationFrameId: number | null = null

const initStarfield = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width = window.innerWidth
  const h = canvas.height = window.innerHeight

  stars = []
  for (let i = 0; i < 300; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 1.2,
      alpha: Math.random(),
      speed: (Math.random() * 0.0002) + 0.0001
    })
  }

  const animate = () => {
    ctx.fillStyle = 'rgba(3, 5, 8, 0.2)'
    ctx.fillRect(0, 0, w, h)

    stars.forEach(star => {
      star.x -= star.speed * 100
      if (star.x < 0) star.x = w

      ctx.beginPath()
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`
      ctx.fill()
    })

    animationFrameId = requestAnimationFrame(animate)
  }

  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  animate()
}

const getNodeTheme = (type: string) => {
  return themes[type] || themes.core
}

const initSimulation = () => {
  if (!svgRef.value || !containerRef.value) return

  const width = window.innerWidth
  const height = window.innerHeight

  localNodes = props.nodes.map(n => ({ ...toRaw(n), data: { ...toRaw(n.data) } }))
  localLinks = props.links.map(l => ({ ...toRaw(l) }))

  if (localNodes.length === 0) return

  if (simulation) simulation.stop()

  const centerX = width / 2
  const centerY = height / 2
  const centerNode = props.centerNodeId ? localNodes.find((n: any) => n.id === props.centerNodeId) : null

  localNodes.forEach((d: any, i: number) => {
    if (centerNode && d.id === centerNode.id) {
      d.x = centerX
      d.y = centerY
    } else {
      const angle = (2 * Math.PI * i) / localNodes.length
      const radius = Math.min(width, height) / 3
      d.x = centerX + radius * Math.cos(angle)
      d.y = centerY + radius * Math.sin(angle)
    }
    d.vx = 0
    d.vy = 0
    d.fx = null
    d.fy = null
  })

  simulation = d3.forceSimulation(localNodes)
    .force('link', d3.forceLink(localLinks).id((d: any) => d.id).distance(150))
    .force('charge', d3.forceManyBody().strength(-800))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collide', d3.forceCollide().radius(60))
    .on('tick', ticked)
}

const render = () => {
  if (!svgRef.value || !containerRef.value) return

  const svg = d3.select(svgRef.value)
    svg.selectAll('*').remove()

  // 设置 SVG viewBox 用于正确的坐标系统
  const width = window.innerWidth
  const height = window.innerHeight
  svg.attr('viewBox', `0 0 ${width} ${height}`)

  zoomBehavior = d3.zoom()
    .scaleExtent([0.15, 5])
    .on('zoom', (event: any) => {
      svg.select('.links-group').attr('transform', event.transform)
      svg.select('.nodes-group').attr('transform', event.transform)
    })
  svg.call(zoomBehavior)

  svg.append('g').attr('class', 'links-group')
  svg.append('g').attr('class', 'nodes-group')

  // 连线
  linkSelection = svg.select('.links-group')
    .selectAll('line')
    .data(localLinks, (d: any) => `${d.source?.id || d.source}-${d.target?.id || d.target}`)
    .join('line')
    .attr('class', 'link')
    .attr('stroke', (d: any) => {
      const sourceId = d.source?.id || d.source
      const sourceNode = localNodes.find(n => n.id === sourceId)
      return sourceNode ? getNodeTheme(sourceNode.type).hex : '#A855F7'
    })
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6)

  // 节点
  nodeSelection = svg.select('.nodes-group')
    .selectAll('g')
    .data(localNodes, (d: any) => d.id)
    .join('g')
    .style('cursor', 'grab')

  // foreignObject - 移除pointer-events: none，让HTML内容可以接收事件
  nodeSelection.append('foreignObject')
    .attr('width', 140)
    .attr('height', 140)
    .attr('x', -70)
    .attr('y', -70)
    .each(function(this: any, d: any) {
      const fo = d3.select(this)
      const theme = getNodeTheme(d.type)
      const color = theme.hex
      const dim = theme.dim

      let html = ''

      if (d.type === 'user') {
        const userData = d.data || {}
        const username = userData.username || userData.name || 'User'
        const avatar = userData.avatar
        const avatarUrl = avatar && avatar.trim() !== ''
          ? (avatar.startsWith('http') ? avatar : `http://localhost:8181${avatar}`)
          : ''

        if (avatarUrl) {
          html = `<div class="premium-node-wrapper" style="--theme-color: ${color}; --theme-color-dim: ${dim};">
            <div class="node-core">
              <div class="node-halo"></div>
              <img src="${avatarUrl}" class="node-avatar" onerror="this.style.display='none'"/>
            </div>
            <div class="node-badge">${username}</div>
          </div>`
        } else {
          html = `<div class="premium-node-wrapper" style="--theme-color: ${color}; --theme-color-dim: ${dim};">
            <div class="node-core">
              <div class="node-halo"></div>
              <span style="color: #fff; font-size: 18px; font-weight: 700;">${username}</span>
            </div>
            <div class="node-badge">${username}</div>
          </div>`
        }
      } else if (d.type === 'tag') {
        html = `<div class="premium-node-wrapper" style="--theme-color: ${color}; --theme-color-dim: ${dim};">
          <div class="node-core">
            <div class="node-halo"></div>
            <span style="color: ${color}; font-size: 14px;">●</span>
          </div>
          <div class="node-badge">${d.label || 'Tag'}</div>
        </div>`
      } else {
        // galaxy 和 star - 显示 SVG 图标
        const iconSvg = d.type === 'galaxy'
          ? `<svg class="node-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`
          : `<svg class="node-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`

        html = `<div class="premium-node-wrapper" style="--theme-color: ${color}; --theme-color-dim: ${dim};">
          <div class="node-core">
            <div class="node-halo"></div>
            ${iconSvg}
          </div>
          <div class="node-badge">${d.data?.title || d.label || (d.type === 'star' ? 'Note' : 'Galaxy')}</div>
        </div>`
      }

      fo.html(html)

      // 为foreignObject内部的div添加原生DOM事件监听器
      const div = fo.node()?.querySelector('.premium-node-wrapper')
      if (div) {
        div.addEventListener('click', (e: MouseEvent) => {
          e.stopPropagation()
          console.log('[ForceGraph] DOM click on foreignObject content, isDragging:', isDragging)
          if (isDragging) return
          emit('nodeClick', d)
        })
        div.addEventListener('dblclick', (e: MouseEvent) => {
          e.stopPropagation()
          console.log('[ForceGraph] DOM dblclick on foreignObject content')
          // Don't check isDragging for double-click - D3 doesn't generate pseudo-clicks for dblclick
          emit('nodeDoubleClick', d)
        })
        div.addEventListener('contextmenu', (e: MouseEvent) => {
          e.preventDefault()
          e.stopPropagation()
          console.log('[ForceGraph] DOM contextmenu on foreignObject content')
          // Don't check isDragging for context menu - right-click shouldn't trigger drag
          emit('nodeContextMenu', d, e)
        })
      }
    })

  // 拖拽
  nodeSelection.call(
    d3.drag()
      .on('start', function(event: any, d: any) {
        console.log('[ForceGraph] drag start, isDragging will be:', true)
        dragStarted(event, d)
      })
      .on('drag', dragged)
      .on('end', function(event: any, d: any) {
        console.log('[ForceGraph] drag end, isDragging will be cleared in 50ms')
        dragEnded(event, d)
      }) as any
  )

  // 注意：click/dblclick/contextmenu 事件现在直接在 foreignObject 内部的 DOM 元素上处理
  // 这是因为 foreignObject 内的 HTML 内容需要原生事件监听器

  // 居中
  setTimeout(() => {
    if (props.centerNodeId && zoomBehavior) {
      const centerNode = localNodes.find((n: any) => n.id === props.centerNodeId) || localNodes[0]
      if (centerNode) {
        const w = window.innerWidth
        const h = window.innerHeight
        const tx = w / 2 - centerNode.x
        const ty = h / 2 - centerNode.y
        d3.select(svgRef.value).transition().duration(800).call(
          zoomBehavior.transform,
          d3.zoomIdentity.translate(tx, ty).scale(1.3)
        )
      }
    }
  }, 200)
}

function dragStarted(event: any, d: any) {
  isDragging = true
  dragStartPos = { x: event.x, y: event.y }
  if (!event.active) simulation.alphaTarget(0.3).restart()
  d.fx = d.x
  d.fy = d.y
}

function dragged(event: any, d: any) {
  d.fx = event.x
  d.fy = event.y
}

function dragEnded(event: any, d: any) {
  const dragDistance = Math.sqrt(
    Math.pow(event.x - dragStartPos.x, 2) +
    Math.pow(event.y - dragStartPos.y, 2)
  )
  // Only consider it a real drag if moved more than threshold
  // This allows small movements that D3 might interpret as drags to still trigger clicks
  const wasRealDrag = dragDistance > DRAG_THRESHOLD

  // If it was a real drag, ignore the upcoming D3 pseudo-click for 100ms
  // If it wasn't a real drag (just a click), clear immediately
  if (wasRealDrag) {
    setTimeout(() => { isDragging = false }, 100)
  } else {
    isDragging = false
  }

  if (!event.active) simulation.alphaTarget(0)
  d.fx = null
  d.fy = null
}

function ticked() {
  if (!linkSelection || !nodeSelection) return

  linkSelection
    .attr('x1', (d: any) => d.source.x)
    .attr('y1', (d: any) => d.source.y)
    .attr('x2', (d: any) => d.target.x)
    .attr('y2', (d: any) => d.target.y)

  nodeSelection.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
}

watch([() => props.nodes, () => props.links], async () => {
  await nextTick()
  initSimulation()
  render()
}, { deep: true })

watch(() => props.centerNodeId, () => {
  render()
})

const zoomToNode = (nodeId: string) => {
  if (!nodeId || !svgRef.value || !zoomBehavior) return
  const node = localNodes.find((n: any) => n.id === nodeId)
  if (!node) return

  const width = window.innerWidth
  const height = window.innerHeight

  d3.select(svgRef.value).transition().duration(500).call(
    zoomBehavior.transform,
    d3.zoomIdentity.translate(width / 2 - node.x, height / 2 - node.y).scale(1.5)
  )
}

const handleResize = () => {
  initStarfield()
  initSimulation()
  render()
}

const handleVisibilityChange = () => {
  if (document.visibilityState === 'visible' && simulation) {
    simulation.alpha(0.3).restart()
  }
}

onMounted(async () => {
  await nextTick()
  initStarfield()
  initSimulation()
  render()

  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (simulation) simulation.stop()
})

defineExpose({ zoomToNode })
</script>

<style scoped>
.force-graph-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}

.starfield-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

.graph-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>

<style>
.link {
  stroke: rgba(255, 255, 255, 0.1);
  stroke-width: 1.5px;
  transition: stroke 0.3s ease;
}

.premium-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.premium-node-wrapper:active {
  cursor: grabbing;
}

.node-core {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #0B101A;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: inset 0 0 15px var(--theme-color-dim),
              0 4px 10px rgba(0, 0, 0, 0.5);
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  z-index: 2;
}

.node-halo {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid var(--theme-color);
  opacity: 0;
  transform: scale(1);
  transition: all 0.3s ease;
}

.node-badge {
  margin-top: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(10, 15, 25, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  z-index: 3;
}

.node-icon {
  color: var(--theme-color);
  transition: color 0.3s ease, transform 0.3s ease;
}

.node-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.premium-node-wrapper:hover .node-core {
  transform: scale(1.1);
  border-color: var(--theme-color);
  box-shadow: inset 0 0 25px var(--theme-color-dim),
              0 0 20px var(--theme-color-dim);
}

.premium-node-wrapper:hover .node-halo {
  opacity: 0.5;
  transform: scale(1.3);
}

.premium-node-wrapper:hover .node-badge {
  color: #FFFFFF;
  border-color: var(--theme-color-dim);
  background: rgba(10, 15, 25, 0.9);
  transform: translateY(2px);
}
</style>