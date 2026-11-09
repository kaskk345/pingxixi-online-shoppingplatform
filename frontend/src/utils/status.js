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

/** 订单五状态 + 取消终态 */
export const orderStatus = {
  PLACED: '客户下单',
  CONFIRMED: '商家确认',
  PREPARED: '备货完成',
  SHIPPED: '开始发货',
  COMPLETED: '交易完成',
  CANCELED: '已取消'
}

export const orderStatusType = {
  PLACED: 'warning',
  CONFIRMED: 'primary',
  PREPARED: 'primary',
  SHIPPED: 'success',
  COMPLETED: 'success',
  CANCELED: 'info'
}

/** 订单流程节点顺序，用于进度展示 */
export const ORDER_FLOW = ['PLACED', 'CONFIRMED', 'PREPARED', 'SHIPPED', 'COMPLETED']

/** 客户可取消：开始发货前 */
export function cancellableByCustomer(row) {
  return row?.cancellableByCustomer === true
}

/** 商家可取消：交易完成前 */
export function cancellableBySeller(row) {
  return row?.cancellableBySeller === true
}
