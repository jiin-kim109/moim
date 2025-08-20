import { createClient } from 'npm:@supabase/supabase-js@2';
import { ExpoPushMessage, WebhookPayload } from '../types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const expoAccessToken = Deno.env.get('EXPO_ACCESS_TOKEN')!

function sendEmptyResponse() {
  return new Response(JSON.stringify({}), {
    headers: { 'Content-Type': 'application/json' }
  })
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
)

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json()

    if (payload.type !== 'INSERT' || payload.record.message_type !== 'user_message') {
      return sendEmptyResponse()
    }

    const message = payload.record

    const { data: chatroomData, error: chatroomError } = await supabase
      .from('chatroom')
      .select(`
        title,
        chatroom_participants!inner(
          user_id,
          nickname,
          user_profile(push_notification_token, notification_enabled)
        )
      `)
      .eq('id', message.chatroom_id)
      .single()

    if (chatroomError) {
      console.error('Error fetching chatroom data:', chatroomError)
      throw chatroomError
    }

    if (!chatroomData?.chatroom_participants || chatroomData.chatroom_participants.length === 0) {
      return sendEmptyResponse()
    }

    // Separate sender and other participants
    const senderParticipant = chatroomData.chatroom_participants.find(
      (p: any) => p.user_id === message.sender_id
    )
    const otherParticipants = chatroomData.chatroom_participants.filter(
      (p: any) => p.user_id !== message.sender_id
    )

    // Temporary filter participants with valid push tokens and notifications enabled
    const participantTokens = otherParticipants.reduce((acc: string[], participant: any) => {
      if (participant.user_profile?.push_notification_token && 
          participant.user_profile?.notification_enabled !== false) {
        acc.push(participant.user_profile.push_notification_token)
      }
      return acc
    }, []);

    if (participantTokens.length === 0) {
      return sendEmptyResponse()
    }

    const senderNickname = senderParticipant?.nickname || 'Someone'

    const notificationMessages: ExpoPushMessage[] = participantTokens.map((token: string) => ({
      to: token,
      sound: 'notification.wav',
      title: chatroomData.title,
      body: `${senderNickname}: ${message.message}`,
      route: `/chatroom/${message.chatroom_id}`,
      data: {
        chatroom_id: message.chatroom_id,
        message_id: message.id,
      }
    }))

    console.log(`Sending ${notificationMessages.length} push notifications`)

    // Send notifications to Expo Push API
    const expoPushResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${expoAccessToken}`,
      },
      body: JSON.stringify(notificationMessages),
    })

    if (!expoPushResponse.ok) {
      const errorText = await expoPushResponse.text()
      throw new Error(`Expo push API error: ${expoPushResponse.status} ${errorText}`)
    }

    const expoPushResult = await expoPushResponse.json()
    console.log('Expo push result:', expoPushResult)

    return new Response(JSON.stringify({ 
      success: true, 
      sent_count: notificationMessages.length,
      expo_result: expoPushResult 
    }), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in send-push-notification function:', error)
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' } 
    })
  }
})
