import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'


import ShopifyProduct from '../views/ShopifyProduct.vue'
import MomoProduct from '../views/MomoProduct.vue'
import PchomeProduct from '../views/PchomeProduct.vue'
import YahooProduct from '../views/YahooProduct.vue'
import ShopeeProduct from '../views/ShopeeProduct.vue'
import MomoPlusProduct from '../views/MomoPlusProduct.vue'

import ShopifyOrder from '../views/ShopifyOrder.vue'
import MomoOrder from '../views/MomoOrder.vue'


const routes = [
  { path: '/', component: HomeView },
  { path: '/shopifyProduct', component: ShopifyProduct },
  { path: '/momoProduct', component: MomoProduct },
  { path: '/pchomeProduct', component: PchomeProduct },
  { path: '/yahooProduct', component: YahooProduct },
  { path: '/shopeeProduct', component: ShopeeProduct },
  { path: '/momoPlusProduct', component: MomoPlusProduct },

  { path: '/shopifyOrder', component: ShopifyOrder },
  { path: '/momoOrder', component: MomoOrder }
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router