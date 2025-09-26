import { NextRequest } from 'next/server'
import { PubSubService } from '../../../lib/services/pubsub.service'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const channel = searchParams.get('channel') || 'booking:updates'

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', channel })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Subscribe to Redis pub/sub
      PubSubService.subscribe(channel, (message) => {
        const data = `data: ${JSON.stringify(message)}\n\n`
        controller.enqueue(encoder.encode(data))
      })

      // Keep connection alive
      const keepAlive = setInterval(() => {
        const data = `data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`
        controller.enqueue(encoder.encode(data))
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        PubSubService.unsubscribe(channel)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}