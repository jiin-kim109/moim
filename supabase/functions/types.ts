export interface ExpoPushMessage {
  to: string
  sound: 'default'
  title: string
  body: string
  route: string | undefined
  data: object | undefined
}

export interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: any
  schema: 'public'
  old_record: null | any
}