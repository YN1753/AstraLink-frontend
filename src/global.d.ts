declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  // ComponentCustomProperties
  interface ComponentCustomProperties {
    $route: RouteLocationNormalized
    $router: Router
  }
}

export {} // Important!