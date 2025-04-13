<template>
  <div class="product-query">
    <!-- 查詢區域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="queryForm" size="default" class="query-form" @submit.prevent="handleQuery">
        <el-form-item label="關鍵字">
          <el-input v-model="queryForm.searchText" placeholder="請輸入訂單編號或顧客名稱" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery" :loading="loading">
            查詢
          </el-button>
          <el-button type="success" @click="openSyncOrders">
            資料同步
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 訂單列表 -->
    <el-card class="table-card" shadow="never">
      <div class="table-wrapper">
        <el-table ref="orderTableRef" v-loading="loading" :data="orderList" style="width: 100%" size="default"
          :header-cell-style="{
            background: '#F5F7FA',
            color: '#606266',
            fontWeight: '600',
            fontSize: '14px'
          }" height="calc(100vh - 280px)" :virtual-scroll="true" border fit :resizable="true"
          @sort-change="handleSortChange">
          <el-table-column type="expand">
            <template #default="props">
              <div class="order-details">
                <div class="detail-section">
                  <div class="shipping-info">
                    <h4>收件資訊</h4>
                    <div class="info-row">
                      <span class="info-label">收件人:</span>
                      <span class="info-value">{{ props.row.shippingName }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">電話:</span>
                      <span class="info-value">{{ props.row.shippingPhone }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">地址:</span>
                      <span class="info-value">{{ props.row.shippingCity }} {{ props.row.shippingAddress1 }}</span>
                    </div>
                  </div>
                </div>

                <div class="line-items">
                  <h4>訂單項目</h4>
                  <el-table :data="props.row.lineItems" border size="small" class="inner-table">
                    <el-table-column prop="title" label="商品名稱" min-width="200" />
                    <el-table-column prop="sku" label="SKU" width="120" />
                    <el-table-column prop="quantity" label="數量" width="80" align="center" />
                    <el-table-column prop="price" label="單價" width="120" align="right">
                      <template #default="scope">
                        {{ formatCurrency(scope.row.price) }}
                      </template>
                    </el-table-column>
                    <el-table-column label="小計" width="120" align="right">
                      <template #default="scope">
                        {{ formatCurrency(scope.row.price * scope.row.quantity) }}
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column v-for="(column, key) in columns" :key="key" v-bind="column">
            <template #default="scope">
              <component :is="renderColumn(column, scope.row)" />
            </template>
          </el-table-column>
        </el-table>

        <!-- 結果統計 -->
        <div class="table-footer" v-if="orderList.length > 0">
          <div class="result-summary">
            <span>總筆數: {{ orderList.length }} 筆</span>
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
  name: {
    prop: 'name',
    label: '訂單編號',
    minWidth: 110,
    fixed: true,
    resizable: true
  },
  createdAt: {
    prop: 'createdAt',
    label: '日期',
    minWidth: 140,
    sortable: true,
    resizable: true
  },
  customerName: {
    prop: 'customerName',
    label: '顧客',
    minWidth: 110,
    resizable: true
  },
  totalPrice: {
    prop: 'totalPrice',
    label: '總計',
    minWidth: 110,
    align: 'right',
    sortable: true,
    resizable: true
  },
  financialStatus: {
    prop: 'financialStatus',
    label: '付款狀態',
    minWidth: 100,
    sortable: true,
    resizable: true
  },
  fulfillmentStatus: {
    prop: 'fulfillmentStatus',
    label: '出貨狀態',
    minWidth: 100,
    sortable: true,
    resizable: true
  },
  tags: {
    prop: 'tags',
    label: '標籤',
    minWidth: 150,
    resizable: true
  },
  itemCount: {
    label: '品項',
    minWidth: 100,
    align: 'center',
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
  name: 'ShopifyOrder',
  setup() {
    // axios 前置變數
    const $prefix = inject('$prefix');

    // 基礎數據
    const loading = ref(false)
    const orderList = ref([])
    const orderTableRef = ref(null)

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

        const url = $prefix + `api/shopify/order/read?${params.toString()}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Network response was not ok')

        const data = await response.json()

        // 處理訂單數據，計算每個訂單的商品數量
        const processedData = data.slice(0, 2000).map(order => ({
          ...order,
          itemCount: order.lineItems ? order.lineItems.length : 0
        }))

        orderList.value = processedData
      } catch (error) {
        console.error('查詢訂單失敗:', error)
        ElMessage.error('查詢失敗，請稍後再試')
      } finally {
        loading.value = false
      }
    }

    // 在Shopify後台查看訂單
    const openShopifyOrder = (orderId) => {
      const url = `https://admin.shopify.com/store/mabuvalley/orders/${orderId}`
      window.open(url, '_blank')
    }

    // 開啟外部連結函數
    const openSyncOrders = () => {
      // 這裡設定您想要開啟的特定網址
      const url = 'https://mabuvalley-sync-py-production.up.railway.app/api/sync/shopify/orders'
      window.open(url, '_blank')
    }

    // 格式化金額顯示
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('zh-TW', {
        style: 'decimal',
        minimumFractionDigits: 2
      }).format(amount)
    }

    // 格式化日期時間顯示
    const formatDateTime = (dateTimeStr) => {
      if (!dateTimeStr) return '-'
      const date = new Date(dateTimeStr)
      // 使用類似圖片中的日期格式 今天 下午2:30
      const now = new Date()
      const isToday = date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

      const isYesterday = date.getDate() === now.getDate() - 1 &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()

      const hours = date.getHours()
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const timeStr = `${hours >= 12 ? '下午' : '上午'}${hours > 12 ? hours - 12 : hours}:${minutes}`

      if (isToday) {
        return `今天 ${timeStr}`
      } else if (isYesterday) {
        return `昨天 ${timeStr}`
      } else {
        // 使用標準日期格式 (年-月-日 時間)
        const year = date.getFullYear()
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        
        return `${year}-${month}-${day} ${timeStr}`
      }
    }

    // 獲取付款狀態標籤類型
    const getFinancialStatusType = (status) => {
      const statusMap = {
        'paid': '',  // 圓點樣式，無背景
        'pending': 'warning',
        'refunded': 'info',
        'partially_refunded': 'info',
        'voided': '',
        'default': ''
      }
      return statusMap[status] || statusMap.default
    }

    // 獲取付款狀態顯示文字
    const getFinancialStatusText = (status) => {
      const statusMap = {
        'paid': '已付款',
        'pending': '付款待處理',
        'refunded': '已退款',
        'partially_refunded': '部分退款',
        'voided': '已退款',
        'default': '未知'
      }
      return statusMap[status] || statusMap.default
    }

    // 獲取出貨狀態標籤類型
    const getFulfillmentStatusType = (status) => {
      const statusMap = {
        'fulfilled': '',  // 圓點樣式，無背景
        'partial': 'warning',
        'unfulfilled': 'warning',
        'default': 'warning'
      }
      return statusMap[status] || statusMap.default
    }

    // 獲取出貨狀態顯示文字
    const getFulfillmentStatusText = (status) => {
      if (!status) return '未出貨'
      const statusMap = {
        'fulfilled': '已出貨',
        'partial': '已部分出貨',
        'unfulfilled': '未出貨',
        'default': '未出貨'
      }
      return statusMap[status] || statusMap.default
    }

    // 處理標籤顯示
    const renderTags = (tags) => {
      if (!tags) return h('span', {}, '-')

      // 將標籤字符串拆分為數組
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag)

      if (tagArray.length === 0) return h('span', {}, '-')

      // 創建標籤元素
      return h('div', { class: 'tag-container' },
        tagArray.map(tag =>
          h(ElTag, {
            size: 'small',
            effect: 'plain',
            style: {
              marginRight: '5px',
              marginBottom: '5px'
            }
          }, () => tag)
        )
      )
    }

    // 欄位渲染函數
    const renderColumn = (column, row) => {
      switch (column.prop) {
        case 'name':
          return h('a', {
            class: 'order-number',
            onClick: () => openShopifyOrder(row.id)
          }, row.name)
        case 'totalPrice':
          return h('span', {
            class: 'amount'
          }, `$${formatCurrency(row.totalPrice)}`)
        case 'financialStatus':
          if (row.financialStatus === 'paid' || row.financialStatus === 'voided') {
            return h('div', { class: 'status-with-dot' }, [
              h('span', { class: 'status-dot paid' }),
              h('span', { class: 'status-text' }, getFinancialStatusText(row.financialStatus))
            ])
          } else {
            return h(ElTag, {
              type: getFinancialStatusType(row.financialStatus),
              size: 'small',
              effect: 'light'
            }, () => getFinancialStatusText(row.financialStatus))
          }
        case 'fulfillmentStatus':
          if (row.fulfillmentStatus === 'fulfilled') {
            return h('div', { class: 'status-with-dot' }, [
              h('span', { class: 'status-dot fulfilled' }),
              h('span', { class: 'status-text' }, getFulfillmentStatusText(row.fulfillmentStatus))
            ])
          } else {
            return h(ElTag, {
              type: getFulfillmentStatusType(row.fulfillmentStatus),
              size: 'small',
              effect: 'light'
            }, () => getFulfillmentStatusText(row.fulfillmentStatus))
          }
        case 'createdAt':
          return h('span', {}, formatDateTime(row.createdAt))
        case 'tags':
          return renderTags(row.tags)
        default:
          if (column.label === '品項') {
            return h('span', {}, `${row.itemCount || 0} 個品項`)
          }
          return h('span', {}, row[column.prop] || '-')
      }
    }

    // 排序處理
    const handleSortChange = ({ prop, order }) => {
      if (!prop || !order) return

      orderList.value.sort((a, b) => {
        if (prop === 'totalPrice') {
          return order === 'ascending'
            ? a[prop] - b[prop]
            : b[prop] - a[prop]
        }

        if (prop === 'createdAt') {
          const dateA = new Date(a[prop]).getTime()
          const dateB = new Date(b[prop]).getTime()
          return order === 'ascending'
            ? dateA - dateB
            : dateB - dateA
        }

        if (prop === 'financialStatus') {
          const statusOrder = ['paid', 'pending', 'partially_refunded', 'refunded', 'voided']
          const statusA = statusOrder.indexOf(a[prop])
          const statusB = statusOrder.indexOf(b[prop])
          return order === 'ascending' ? statusA - statusB : statusB - statusA
        }

        if (prop === 'fulfillmentStatus') {
          const statusOrder = ['fulfilled', 'partial', 'unfulfilled', null]
          const statusA = statusOrder.indexOf(a[prop])
          const statusB = statusOrder.indexOf(b[prop])
          return order === 'ascending' ? statusA - statusB : statusB - statusA
        }

        return 0
      })
    }

    // 頁面載入時不自動查詢
    onMounted(() => {
      // 不再自動執行查詢
      orderList.value = [] // 確保列表初始為空
    })

    return {
      loading,
      queryForm,
      orderList,
      orderTableRef,
      columns: COLUMNS,
      handleQuery,
      handleSortChange,
      renderColumn,
      openSyncOrders,
      formatCurrency
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

.order-number {
  color: #409EFF;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
}

.order-number:hover {
  text-decoration: underline;
}

.status-with-dot {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.status-dot.paid {
  background-color: #606266;
}

.status-dot.fulfilled {
  background-color: #606266;
}

.status-text {
  font-size: 12px;
  color: #606266;
}

.tag-container {
  display: flex;
  flex-wrap: wrap;
}

/* 訂單詳情樣式 */
.order-details {
  padding: 16px;
  background-color: #FAFAFA;
}

.inner-table {
  margin-top: 8px;
}

.detail-section {
  margin-bottom: 16px;
}

.shipping-info h4,
.line-items h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.info-row {
  display: flex;
  margin-bottom: 6px;
}

.info-label {
  width: 60px;
  color: #606266;
  font-size: 13px;
}

.info-value {
  font-size: 13px;
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

.table-header {
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.sync-status .el-icon {
  color: #909399;
}

@media (max-width: 768px) {
  .query-form {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>