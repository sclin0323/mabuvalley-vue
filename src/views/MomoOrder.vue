<template>
  <div class="product-query">
    <!-- 查詢區域 -->
    <el-card class="search-card" shadow="never">
      <el-form :inline="true" :model="queryForm" size="default" class="query-form" @submit.prevent="handleQuery">
        <el-form-item label="關鍵字">
          <el-input v-model="queryForm.searchText" placeholder="請輸入訂單編號或商品名稱" clearable @keyup.enter="handleQuery" />
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
            <span style="margin-left: 20px;">總銷售金額: ${{ formatCurrency(totalSalesAmount) }}</span>
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
import { inject, ref, reactive, onMounted, h, computed } from 'vue'
import { ElMessage, ElTag } from 'element-plus'

// 表格欄位定義 - 保留重要欄位
const COLUMNS = {
  procDate: {
    prop: 'procDate',
    label: '處理日期',
    minWidth: 120,
    sortable: true,
    resizable: true
  },
  completeOrderNo: {
    prop: 'completeOrderNo',
    label: '訂單編號',
    minWidth: 180,
    resizable: true,
    fixed: 'left'
  },
  entpGoodsNo: {
    prop: 'entpGoodsNo',
    label: '企業商品編號',
    minWidth: 140,
    resizable: true
  },
  goodsName: {
    prop: 'goodsName',
    label: '商品名稱',
    minWidth: 200,
    resizable: true,
    showOverflowTooltip: true
  },
  receiverMask: {
    prop: 'receiverMask',
    label: '收件人',
    minWidth: 100,
    resizable: true
  },
  salePrice: {
    prop: 'salePrice',
    label: '售價',
    minWidth: 100,
    align: 'right',
    sortable: true,
    resizable: true
  },
  buyPrice: {
    prop: 'buyPrice',
    label: '成交價',
    minWidth: 100,
    align: 'right',
    sortable: true,
    resizable: true
  },
  slipNo: {
    prop: 'slipNo',
    label: '出貨狀態',
    minWidth: 120,
    resizable: true
  },
  crtTimeTxt: {
    prop: 'crtTimeTxt',
    label: '同步時間',
    minWidth: 140,
    resizable: true,
    fixed: 'right'
  }
}

export default {
  name: 'MomoOrder',
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

    // 計算總銷售金額
    const totalSalesAmount = computed(() => {
      return orderList.value.reduce((total, order) => {
        return total + (order.buyPrice || 0)
      }, 0)
    })

    // 處理查詢
    const handleQuery = async () => {
      loading.value = true
      try {
        const params = new URLSearchParams()
        if (queryForm.searchText) params.append('searchText', queryForm.searchText)

        const url = $prefix + `api/momo/order/read?${params.toString()}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Network response was not ok')

        const data = await response.json()

        // 處理訂單數據，限制最多2000筆
        orderList.value = data.slice(0, 2000)
      } catch (error) {
        console.error('查詢訂單失敗:', error)
        ElMessage.error('查詢失敗，請稍後再試')
      } finally {
        loading.value = false
      }
    }

    // 開啟外部連結函數
    const openSyncOrders = () => {
      // momo 同步 API 網址
      const url = 'https://mabuvalley-sync-py-production.up.railway.app/api/sync/momo/orders'
      window.open(url, '_blank')
    }

    // 格式化金額顯示
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('zh-TW', {
        style: 'decimal',
        minimumFractionDigits: 0
      }).format(amount)
    }

    // 格式化日期顯示
    const formatDate = (dateStr) => {
      if (!dateStr) return '-'
      try {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })
      } catch {
        return dateStr
      }
    }

    // 獲取出貨狀態類型
    const getShipmentStatusType = (status) => {
      if (!status) return 'info'
      // 判斷是否為數字出貨單號
      if (/^\d+$/.test(status)) return 'success'
      if (status.includes('未出')) return 'warning'
      if (status.includes('已出') || status.includes('完成')) return 'success'
      if (status.includes('退')) return 'danger'
      return 'info'
    }

    // 獲取出貨狀態顯示文字
    const getShipmentStatusText = (status) => {
      if (!status) return '未知'
      // 如果是數字出貨單號，顯示為已出貨
      if (/^\d+$/.test(status)) return `已出貨 (${status})`
      return status
    }

    // 獲取訂單類型標籤類型
    const getOrderTypeType = (type) => {
      if (type === '一般訂單') return ''
      if (type === '預購訂單') return 'warning'
      if (type === '特殊訂單') return 'info'
      return 'info'
    }

    // 欄位渲染函數
    const renderColumn = (column, row) => {
      switch (column.prop) {
        case 'completeOrderNo':
          return h('span', {
            class: 'order-number'
          }, row.completeOrderNo)
        case 'entpGoodsNo':
          return h('span', {
            class: 'goods-code',
            style: 'font-family: Monaco, monospace; color: #666;'
          }, row.entpGoodsNo || '-')
        case 'goodsCode':
          return h('span', {
            class: 'goods-code',
            style: 'font-family: Monaco, monospace; color: #666;'
          }, row.goodsCode || '-')
        case 'procDate':
          return h('span', {
            class: 'date-field'
          }, formatDate(row.procDate))
        case 'salePrice':
        case 'buyPrice':
          // 直接使用 formattedBuyPrice 和 formattedSalePrice 如果有的話
          const formattedField = column.prop === 'buyPrice' ? 'formattedBuyPrice' : 'formattedSalePrice'
          const displayValue = row[formattedField] || `${formatCurrency(row[column.prop])}`
          return h('span', {
            class: 'amount'
          }, displayValue)
        case 'orderTypeStr':
          return h(ElTag, {
            type: getOrderTypeType(row.orderTypeStr),
            size: 'small',
            effect: 'light'
          }, () => row.orderTypeStr)
        case 'slipNo':
          return h(ElTag, {
            type: getShipmentStatusType(row.slipNo),
            size: 'small',
            effect: 'light'
          }, () => getShipmentStatusText(row.slipNo))
        case 'goodsName':
          return h('span', {
            class: 'goods-name',
            title: row.goodsName
          }, row.goodsName)
        case 'receiverMask':
          return h('span', {
            class: 'receiver-name'
          }, row.receiverMask || '-')
        case 'crtTimeTxt':
          return h('span', {
            class: 'sync-time',
            style: 'font-size: 12px; color: #909399;'
          }, row.crtTimeTxt || '-')
        case 'delyGbName':
          // 使用 fullDeliveryInfo 如果有的話，否則使用原始值
          return h('span', {}, row.fullDeliveryInfo || row.delyGbName || '-')
        default:
          return h('span', {}, row[column.prop] || '-')
      }
    }

    // 排序處理
    const handleSortChange = ({ prop, order }) => {
      if (!prop || !order) return

      orderList.value.sort((a, b) => {
        if (prop === 'salePrice' || prop === 'buyPrice') {
          return order === 'ascending'
            ? a[prop] - b[prop]
            : b[prop] - a[prop]
        }

        if (prop === 'procDate') {
          const dateA = new Date(a[prop]).getTime()
          const dateB = new Date(b[prop]).getTime()
          return order === 'ascending'
            ? dateA - dateB
            : dateB - dateA
        }

        // 字串排序
        const valueA = (a[prop] || '').toString()
        const valueB = (b[prop] || '').toString()
        return order === 'ascending'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      })
    }

    // 頁面載入時不自動查詢
    onMounted(() => {
      orderList.value = [] // 確保列表初始為空
    })

    return {
      loading,
      queryForm,
      orderList,
      orderTableRef,
      columns: COLUMNS,
      totalSalesAmount,
      handleQuery,
      handleSortChange,
      renderColumn,
      openSyncOrders,
      formatCurrency,
      formatDate,
      getShipmentStatusText
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
  display: flex;
  justify-content: space-between;
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
  font-family: Monaco, monospace;
}

.goods-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.goods-code {
  font-size: 12px;
  color: #666;
}

.receiver-name {
  color: #303133;
  font-weight: 500;
}

.date-field {
  color: #606266;
  font-size: 13px;
}

.sync-time {
  font-size: 12px;
  color: #909399;
  font-family: Monaco, monospace;
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
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .result-summary {
    flex-direction: column;
    gap: 5px;
  }
}
</style>