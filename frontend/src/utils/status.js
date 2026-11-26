export const productStatus = {
  ON_SALE: '在售',
  FROZEN: '已冻结',
  OFF_SHELF: '已下架',
  RESTORED: '已恢复在售'
}

export const intentStatus = {
  WAITING: '等候中',
  TRADING: '交易中',
  SUCCEEDED: '交易成功',
  FAILED: '交易失败',
  VOID: '已作废',
  CANCELED: '已撤销'
}

/** 商品是否可被购买 / 可提交意向 */
export function buyable(status) {
  return status === 'ON_SALE' || status === 'RESTORED'
}

/** 订单五状态 + 支付两状态 + 取消终态 */
export const orderStatus = {
  PLACED: '客户下单',
  PENDING_PAY: '待支付',
  PAID: '已支付',
  CONFIRMED: '商家确认',
  PREPARED: '备货完成',
  SHIPPED: '开始发货',
  COMPLETED: '交易完成',
  CANCELED: '已取消'
}

export const orderStatusType = {
  PLACED: 'warning',
  PENDING_PAY: 'danger',
  PAID: 'success',
  CONFIRMED: 'primary',
  PREPARED: 'primary',
  SHIPPED: 'success',
  COMPLETED: 'success',
  CANCELED: 'info'
}

/** 支付渠道 */
export const paymentChannel = {
  ALIPAY: '支付宝',
  WECHAT: '微信支付',
  BANK_CARD: '银行卡',
  CREDIT_CARD: '信用卡'
}

/** 支付方式分类（对应需求 C.1：第三方支付 / 银行卡信用卡支付） */
export const paymentChannelGroups = [
  { label: '第三方支付', desc: '支付宝、微信支付', channels: ['ALIPAY', 'WECHAT'] },
  { label: '银行卡支付', desc: '储蓄卡、信用卡', channels: ['BANK_CARD', 'CREDIT_CARD'] }
]

/** 支付单状态 */
export const paymentStatus = {
  CREATED: '待支付',
  SUCCESS: '支付成功',
  FAILED: '支付失败',
  CLOSED: '已关闭',
  REFUNDED: '已退款'
}

/** 订单流程节点顺序，用于进度展示 */
export const ORDER_FLOW = ['PLACED', 'PENDING_PAY', 'PAID', 'CONFIRMED', 'PREPARED', 'SHIPPED', 'COMPLETED']

/** 快递公司字典（挑战 C.2，仅作运单归属标识，不对接快递接口） */
export const expressCompanies = [
  { code: 'SF', label: '顺丰速运' },
  { code: 'JD', label: '京东物流' },
  { code: 'ZTO', label: '中通快递' },
  { code: 'YTO', label: '圆通速递' },
  { code: 'YUNDA', label: '韵达速递' },
  { code: 'STO', label: '申通快递' },
  { code: 'JTSD', label: '极兔速递' },
  { code: 'DBL', label: '德邦快递' },
  { code: 'EMS', label: '中国邮政EMS' }
]

export const expressCompanyLabel = (code) =>
  expressCompanies.find((c) => c.code === code)?.label || code || '—'

/** 物流状态：系统内维护，买家只读 */
export const logisticsStatus = {
  COLLECTED: '已揽收',
  IN_TRANSIT: '运输中',
  DELIVERING: '派送中',
  SIGNED: '已签收',
  EXCEPTION: '物流异常'
}

export const logisticsStatusType = {
  COLLECTED: 'warning',
  IN_TRANSIT: 'primary',
  DELIVERING: 'primary',
  SIGNED: 'success',
  EXCEPTION: 'danger'
}

/** 物流推进顺序 */
export const LOGISTICS_FLOW = ['COLLECTED', 'IN_TRANSIT', 'DELIVERING', 'SIGNED']

/** 售后诉求（客户申请时选择） */
export const afterSaleType = {
  RETURN_REFUND: '退货退款',
  REFUND_ONLY: '仅退款',
  EXCHANGE: '换货',
  REPAIR: '维修'
}

/** 商家处理结果 */
export const afterSaleResult = {
  RETURN_REFUND: '同意退货退款',
  REFUND_ONLY: '同意仅退款',
  EXCHANGE: '同意换货',
  REPAIR: '同意维修',
  REJECT: '拒绝售后'
}

/** 售后单状态（独立于订单状态机） */
export const afterSaleStatus = {
  PENDING: '待处理',
  NEGOTIATING: '协商中',
  RETURNING: '退货中',
  COMPLETED: '已完成',
  REJECTED: '已拒绝',
  CANCELED: '已撤销'
}

export const afterSaleStatusType = {
  PENDING: 'warning',
  NEGOTIATING: 'primary',
  RETURNING: 'warning',
  COMPLETED: 'success',
  REJECTED: 'danger',
  CANCELED: 'info'
}

/** 客户可取消：开始发货前 */
export function cancellableByCustomer(row) {
  return row?.cancellableByCustomer === true
}

/** 商家可取消：交易完成前 */
export function cancellableBySeller(row) {
  return row?.cancellableBySeller === true
}
