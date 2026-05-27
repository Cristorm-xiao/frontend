export async function runActionWithFeedback({
  action,
  reload,
  setError,
  setSuccess,
  successMessage,
  fallbackErrorMessage = '操作失败'
}) {
  setError('')
  setSuccess('')

  try {
    await action()
    await reload({ preserveFeedback: true })
    setSuccess(successMessage)
  } catch (err) {
    const message = err?.message || fallbackErrorMessage
    await reload({ preserveFeedback: true }).catch(() => {})
    setError(message)
  }
}
