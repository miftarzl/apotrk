const chatbotService = require('../services/chatbotService')

async function handleChat(req, res) {
  try {
    const { message } = req.body || {}
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message required' })
    }
    const reply = await chatbotService.processMessage(message)
    return res.json({ reply })
  } catch (err) {
    console.error('chatbot error', err)
    return res.status(500).json({ error: 'internal' })
  }
}

module.exports = { handleChat }
