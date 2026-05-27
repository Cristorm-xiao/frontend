import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { runActionWithFeedback } from './actionFeedback.js'

test('keeps the failure message after reloading stale order data', async () => {
  let error = ''
  let success = ''
  const reloadCalls = []

  await runActionWithFeedback({
    action: async () => {
      throw new Error('订单状态已变化，请刷新后重试。')
    },
    reload: async (options) => {
      reloadCalls.push(options)
      error = ''
    },
    setError: (value) => {
      error = value
    },
    setSuccess: (value) => {
      success = value
    },
    successMessage: '订单已确认。',
    fallbackErrorMessage: '操作失败'
  })

  assert.equal(error, '订单状态已变化，请刷新后重试。')
  assert.equal(success, '')
  assert.deepEqual(reloadCalls, [{ preserveFeedback: true }])
})

test('keeps the success message after reloading changed order data', async () => {
  let error = ''
  let success = ''

  await runActionWithFeedback({
    action: async () => {},
    reload: async () => {
      success = ''
    },
    setError: (value) => {
      error = value
    },
    setSuccess: (value) => {
      success = value
    },
    successMessage: '取消申请已通过。',
    fallbackErrorMessage: '操作失败'
  })

  assert.equal(error, '')
  assert.equal(success, '取消申请已通过。')
})

test('orders view uses the shared feedback runner for order actions', async () => {
  const source = await readFile(new URL('../views/OrdersView.vue', import.meta.url), 'utf8')

  assert.match(source, /runActionWithFeedback/)
  assert.doesNotMatch(source, /try\s*\{\s*await action\(\)/)
})
