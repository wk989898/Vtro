import Router from 'vue-router'
import Vue from 'vue'


Vue.use(Router)
// const sub =()=>import('../pages/sub')
// const nodes =()=>import( '../pages/nodes')
// const add =()=>import( '../pages/add')
// const ping =()=>import( '../pages/ping')
// const set =()=>import('../pages/set')
import sub from '../pages/sub'
import nodes from '../pages/nodes'
import add from '../pages/add'

const routes=[
  {
    path:'/',
    redirect:'/nodes'
  },
  {
    path:'/nodes',
    component:nodes
  },
  {
    path:'/sub',
    component:sub
  },
  {
    path:'/add',
    component:add  
  }
]
const router=new Router({
  routes
})
export default router