import Router from 'vue-router'
import Vue from 'vue'


Vue.use(Router)
// const sub =()=>import('../pages/sub')
// const lists =()=>import( '../pages/lists')
// const add =()=>import( '../pages/add')
// const ping =()=>import( '../pages/ping')
// const set =()=>import('../pages/set')
import sub from '../pages/sub'
import lists from '../pages/lists'
import add from '../pages/add'
import set from '../pages/set'

const routes=[
  {
    path:'/',
    redirect:'/lists'
  },
  {
    path:'/lists',
    component:lists
  },
  {
    path:'/sub',
    component:sub
  },
  {
    path:'/add',
    component:add  
  },
  {
    path:'/set',
    component:set  
  }
]
const router=new Router({
  routes
})
export default router