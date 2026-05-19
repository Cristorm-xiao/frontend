import { checkinStatuses, orderStatuses, roleLabels, roomStatuses, roomTypes } from './constants'

const mapLabel = (items, value) => items.find((item) => item.value === value)?.label || value || '-'

export const roomTypeLabel = (value) => mapLabel(roomTypes, value)
export const roomStatusLabel = (value) => mapLabel(roomStatuses, value)
export const orderStatusLabel = (value) => mapLabel(orderStatuses, value)
export const checkinStatusLabel = (value) => mapLabel(checkinStatuses, value)
export const roleLabel = (value) => roleLabels[value] || value || '-'

export function formatMoney(value) {
  const amount = Number(value || 0)
  return `￥${amount.toFixed(2)}`
}

export function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('zh-CN', { hour12: false })
}

export function pageList(payload) {
  return {
    list: payload?.list || [],
    total: payload?.total || 0,
    page: payload?.page || 1,
    pageSize: payload?.page_size || payload?.pageSize || 20
  }
}
