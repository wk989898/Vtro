import Router from 'vue-router'
import Vue from 'vue'


Vue.use(Router)
import sub from '../pages/sub'
import lists from '../pages/lists'
import add from '../pages/add'
import ping from '../pages/ping'
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
    path:'/ping',
    component:ping  
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