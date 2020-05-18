import Router from 'vue-router'
import Vue from 'vue'


Vue.use(Router)
// const sub =()=>import('../pages/sub')
// const add =()=>import( '../pages/add')
// const set =()=>import('../pages/set')
import sub from '../pages/sub'
import add from '../pages/add'
import set from '../pages/set'

const routes=[
  {
    path:'/',
    redirect:'/set'
  },
  {
    path:'/set',
    component:set
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