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
