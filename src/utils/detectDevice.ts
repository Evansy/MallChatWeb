export const judgeClient = (): 'iOS' | 'Android' | 'PC' => {
  let client: 'iOS' | 'Android' | 'PC' = 'PC'
  if (/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    //判断iPhone|iPad|iPod|iOS
    client = 'iOS'
  } else if (/(Android)/i.test(navigator.userAgent)) {
    //判断Android
    client = 'Android'
  }
  return client
}
