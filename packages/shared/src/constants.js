export const API_BASE = '/api/v1'

export const roomTypes = [
  { label: '标准间', value: 'standard' },
  { label: '豪华间', value: 'deluxe' },
  { label: '套房', value: 'suite' }
]

export const roomStatuses = [
  { label: '空闲', value: 'vacant' },
  { label: '已预订', value: 'reserved' },
  { label: '已入住', value: 'occupied' }
]

export const orderStatuses = [
  { label: '待确认', value: 'pending' },
  { label: '已确认', value: 'confirmed' },
  { label: '取消审核中', value: 'cancel_requested' },
  { label: '已取消', value: 'cancelled' }
]

export const checkinStatuses = [
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'completed' }
]

export const roleLabels = {
  guest: '住客',
  employee: '工作人员',
  admin: '管理员',
  waiter: '服务员'
}
