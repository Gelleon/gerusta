try {
  node test-axios.js *>&1 | Out-File run.log
} catch {
  $_.Exception.Message | Out-File run.log
}