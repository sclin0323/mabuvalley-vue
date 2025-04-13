<template>
  <div class="app-container">
    <!-- Sidebar -->
    <aside :class="['sidebar', { 'sidebar-collapsed': isCollapsed }]">
      <!-- Profile Section -->
      <div class="profile-section">
        <div class="profile-container">
          <div class="avatar">
            <span class="avatar-text">MB</span>
          </div>
          <div :class="['profile-info', { 'hidden': isCollapsed }]">
            <span class="profile-name">User Name</span>
            <span class="profile-role">管理員</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="menu">


        <!-- Inventory Query with submenu -->
        <div class="menu-group">
          <div class="menu-item" @click="toggleMenu('inventory')" :class="{ 'active': activeMenus.inventory }">
            <div class="menu-item-content">
              <el-icon>
                <Box />
              </el-icon>
              <span :class="['menu-text', { 'hidden': isCollapsed }]">銷售商品查詢</span>
            </div>
            <el-icon class="expand-icon" v-show="!isCollapsed">
              <ArrowDown v-if="!activeMenus.inventory" />
              <ArrowUp v-else />
            </el-icon>
          </div>
          <transition name="slide">
            <div class="submenu" v-show="!isCollapsed && activeMenus.inventory">
              <router-link to="/shopifyProduct" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">SHOPIFY商品</span>
              </router-link>

              <router-link to="/momoProduct" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">MOMO商品</span>
              </router-link>

              <router-link to="/pchomeProduct" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">PCHOME商品</span>
              </router-link>

              <router-link to="/yahooProduct" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">YAHOO商品</span>
              </router-link>

              <router-link to="/shopeeProduct" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">SHOPEE商品</span>
              </router-link>

              <router-link to="/momoPlusProduct" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">MO店+商品</span>
              </router-link>

            </div>
          </transition>
        </div>

        <!-- Order Query with submenu -->
        <div class="menu-group">
          <div class="menu-item" @click="toggleMenu('order')" :class="{ 'active': activeMenus.order }">
            <div class="menu-item-content">
              <el-icon>
                <Document />
              </el-icon>
              <span :class="['menu-text', { 'hidden': isCollapsed }]">銷售訂單查詢</span>
            </div>
            <el-icon class="expand-icon" v-show="!isCollapsed">
              <ArrowDown v-if="!activeMenus.order" />
              <ArrowUp v-else />
            </el-icon>
          </div>
          <transition name="slide">
            <div class="submenu" v-show="!isCollapsed && activeMenus.order">
              <router-link to="/shopifyOrder" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">SHOPIFY訂單</span>
              </router-link>

              <router-link to="/momoOrder" class="submenu-item">
                <span class="submenu-line"></span>
                <span class="menu-text">MOMO訂單</span>
              </router-link>

            </div>
          </transition>
        </div>

      </nav>

      <!-- Toggle Button -->
      <div class="toggle-btn-container">
        <button class="toggle-btn" @click="toggleSidebar">
          <el-icon>
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Top Bar -->
      <header class="top-bar">
        <h1 class="page-title">銷售通路整合系統 (支持通路: SHOPIFY、MOMO、PCHOME、YAHOO、SHOPEE、MO店+)</h1>
      </header>

      <!-- Page Content -->
      <section class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import {
  Document,
  Box,
  ArrowDown,
  ArrowUp,
  Fold,
  Expand
} from "@element-plus/icons-vue";

export default {
  name: 'App',
  components: {
    Document,
    Box,
    ArrowDown,
    ArrowUp,
    Fold,
    Expand
  },
  setup() {
    const isCollapsed = ref(false);
    const activeMenus = reactive({
      order: true,
      inventory: true
    });

    const toggleSidebar = () => {
      isCollapsed.value = !isCollapsed.value;
    };

    const toggleMenu = (menu) => {
      activeMenus[menu] = !activeMenus[menu];
    };

    return {
      isCollapsed,
      activeMenus,
      toggleSidebar,
      toggleMenu
    };
  }
};
</script>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
  background: #f5f7fa;
}

/* Sidebar Styles */
.sidebar {
  width: 260px;
  background: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  position: relative;
  z-index: 1000;
}

.sidebar-collapsed {
  width: 80px;
}

/* Profile Section */
.profile-section {
  padding: 24px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.profile-container {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 40px;
  height: 40px;
  background: #4b5563;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

.profile-info {
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
}

.profile-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.profile-role {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

/* Menu Styles */
.menu {
  padding: 12px 0;
  flex-grow: 1;
  overflow-y: auto;
}

.menu-group {
  margin: 4px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
  margin: 2px 8px;
  border-radius: 8px;
}

.menu-item:hover {
  background: #f3f4f6;
  color: #2563eb;
}

.menu-item.active {
  background: #eff6ff;
  color: #2563eb;
}

.menu-item-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Submenu Styles */
.submenu {
  padding: 6px 0 6px 48px;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 8px;
  margin: 2px 8px 2px 0;
  position: relative;
}

.submenu-item:hover {
  color: #2563eb;
  background: #f3f4f6;
}

.submenu-line {
  width: 2px;
  height: 24px;
  background-color: currentColor;
  border-radius: 2px;
  opacity: 0.5;
}

.router-link-active.submenu-item {
  color: #2563eb;
  background: #eff6ff;
}

.expand-icon {
  transition: transform 0.3s;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.3s;
  white-space: nowrap;
}

.hidden {
  opacity: 0;
  width: 0;
  overflow: hidden;
}

/* Toggle Button */
.toggle-btn-container {
  padding: 16px;
  border-top: 1px solid #f0f2f5;
}

.toggle-btn {
  width: 100%;
  padding: 8px;
  background: #f9fafb;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: #f3f4f6;
  color: #2563eb;
}

/* Main Content */
.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

/* Top Bar */
.top-bar {
  height: 64px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 32px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

/* Page Content */
.page-content {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* Footer Styles */
.app-footer {
  height: 48px;
  background-color: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  padding: 0 32px;
  flex-shrink: 0;
}

.footer-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #6b7280;
  font-size: 12px;
}

.copyright {
  opacity: 0.8;
}

.version {
  opacity: 0.6;
}

/* Transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Element Plus Icon Sizing */
.el-icon {
  font-size: 18px;
}
</style>