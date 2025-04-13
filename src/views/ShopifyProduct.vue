<template>
  <div class="product-query">
    <!-- 查詢區域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="queryForm" size="default" class="query-form" @submit.prevent="handleQuery">
        <el-form-item label="關鍵字">
          <el-input 
            v-model="queryForm.searchText" 
            placeholder="請輸入產品名稱或SKU" 
            clearable 
            @keyup.enter="handleQuery" 
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">
            查詢
          </el-button>
          <el-button type="success" @click="openSyncProducts">
            資料同步
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 產品列表 -->
    <el-card class="table-card" shadow="never">
      <div class="table-wrapper">
        <el-table 
          ref="productTableRef" 
          v-loading="loading" 
          :data="productList" 
          style="width: 100%" 
          size="default"
          :header-cell-style="{
            background: '#F5F7FA',
            color: '#606266',
            fontWeight: '600',
            fontSize: '14px'
          }" 
          height="calc(100vh - 280px)" 
          :virtual-scroll="true" 
          border
          fit
          :resizable="true"
          @sort-change="handleSortChange">
          <el-table-column v-for="(column, key) in columns" :key="key" v-bind="column">
            <template #default="scope">
              <component :is="renderColumn(column, scope.row)" />
            </template>
          </el-table-column>
        </el-table>

        <!-- 結果統計 -->
        <div class="table-footer" v-if="productList.length > 0">
          <div class="result-summary">
            <span>總筆數: {{ productList.length }} 筆</span>
          </div>
        </div>
        <!-- 無資料提示 -->
        <div class="empty-state" v-else>
          <el-empty description="請輸入關鍵字進行查詢" />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { inject, ref, reactive, onMounted, h } from 'vue'
import { ElMessage, ElTag } from 'element-plus'

// 表格欄位定義
const COLUMNS = {
  title: {
    prop: 'title',
    label: '產品名稱',
    minWidth: 200,
    fixed: true,
    resizable: true,
    showOverflowTooltip: true
  },
  sku: {
    prop: 'sku',
    label: 'SKU',
    minWidth: 120,
    resizable: true,
    showOverflowTooltip: true
  },
  pid: {
    prop: 'pid',
    label: '產品ID',
    minWidth: 100,
    resizable: true
  },
  status: {
    prop: 'status',
    label: '狀態',
    minWidth: 80,
    sortable: true,
    resizable: true
  },
  inventoryQuantity: {
    prop: 'inventoryQuantity',
    label: '庫存數量',
    minWidth: 100,
    align: 'right',
    sortable: true,
    resizable: true
  },
  crtTimeTxt: {
    prop: 'crtTimeTxt',
    label: '同步時間',
    minWidth: 140,
    resizable: true
  }
}

export default {
  name: 'ShopifyProduct',
  setup() {
    // axios 前置變數
    const $prefix = inject('$prefix');

    // 基礎數據
    const loading = ref(false)
    const productList = ref([])
    const productTableRef = ref(null)

    // 設定查詢表單
    const queryForm = reactive({
      searchText: ''
    })

    // 處理查詢
    const handleQuery = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams()
        if (queryForm.searchText) params.append('searchText', queryForm.searchText)

        const url = $prefix + `api/shopify/product/read?${params.toString()}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Network response was not ok')

        const data = await response.json()
        
        productList.value = data.slice(0, 2000)
      } catch (error) {
        console.error('查詢產品失敗:', error)
        ElMessage.error('查詢失敗，請稍後再試')
      } finally {
        loading.value = false
      }
    }

    // 開啟外部連結函數
    const openSyncProducts = () => {
      // 這裡設定您想要開啟的特定網址
      const url = 'https://mabuvalley-sync-py-production.up.railway.app/api/sync/shopify/products'
      window.open(url, '_blank')
    }

    // 獲取產品狀態標籤類型
    const getStatusType = (status) => {
      const statusMap = {
        'active': 'success',
        'draft': 'info',
        'archived': 'danger',
        'default': ''
      }
      return statusMap[status] || statusMap.default
    }

    // 欄位渲染函數
    const renderColumn = (column, row) => {
      switch (column.prop) {
        case 'title':
          return h('span', {
            class: 'product-title'
          }, row.title)
        case 'status':
          return h(ElTag, {
            type: getStatusType(row.status),
            size: 'small'
          }, () => row.status)
        case 'inventoryQuantity':
          return h('span', {
            class: row.inventoryQuantity <= 0 ? 'amount out-of-stock' : 'amount'
          }, `${row.inventoryQuantity}`)
        default:
          return () => row[column.prop]
      }
    }

    // 排序處理
    const handleSortChange = ({ prop, order }) => {
      if (!prop || !order) return

      productList.value.sort((a, b) => {
        if (prop === 'status') {
          const statusOrder = ['active', 'draft', 'archived']
          const statusA = statusOrder.indexOf(a[prop])
          const statusB = statusOrder.indexOf(b[prop])
          return order === 'ascending' ? statusA - statusB : statusB - statusA
        }

        if (prop === 'inventoryQuantity') {
          return order === 'ascending' 
            ? a[prop] - b[prop] 
            : b[prop] - a[prop]
        }

        return 0
      })
    }

    // 頁面載入時不自動查詢
    onMounted(() => {
      // 不再自動執行查詢
      productList.value = [] // 確保列表初始為空
    })

    return {
      loading,
      queryForm,
      productList,
      productTableRef,
      columns: COLUMNS,
      handleQuery,
      handleSortChange,
      renderColumn,
      openSyncProducts
    }
  }
}
</script>

<style scoped>
.product-query {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  padding: 16px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.search-card {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.table-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.table-footer {
  position: sticky;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  border-top: 1px solid #e4e7ed;
  z-index: 10;
}

.result-summary {
  padding: 10px 16px;
  font-size: 12px;
  color: #606266;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.amount {
  font-family: Monaco, monospace;
  font-weight: 500;
}

.amount.out-of-stock {
  color: #F56C6C;
}

.product-title {
  color: #303133;
}

:deep(.el-table) {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

:deep(.el-table th) {
  height: 45px;
  position: relative;
}

:deep(.el-table td) {
  height: 40px;
}

:deep(.el-table-column--selection .cell) {
  padding-left: 14px;
  padding-right: 14px;
}

:deep(.el-table__resize-handle) {
  cursor: col-resize;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table .hover-row) {
  background-color: #f5f7fa;
}

@media (max-width: 768px) {
  .query-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>