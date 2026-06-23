"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence, useDragControls } from "framer-motion"
import { X, Send, Bot, Minimize2, Maximize2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatbotProps {
  onClose: () => void
}

interface Message {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface QuickReply {
  id: string
  text: string
  response: string
}

const Chatbot = ({ onClose }: ChatbotProps) => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Xin chào! Tôi là gzv Assistant 🤖\n\nTôi có thể giúp bạn:\n• Tìm hiểu về các khóa học\n• Thông tin về mentors\n• Hỗ trợ kỹ thuật\n• Tư vấn lộ trình học tập",
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()

  const quickReplies: QuickReply[] = [
    {
      id: "courses",
      text: "📚 Khóa học nào phù hợp với tôi?",
      response:
        "Tuyệt vời! Để tư vấn khóa học phù hợp nhất, bạn có thể cho tôi biết:\n\n🎯 Mục tiêu học tập của bạn?\n💼 Kinh nghiệm hiện tại?\n⏰ Thời gian có thể dành để học?",
    },
    {
      id: "mentors",
      text: "👨‍🏫 Thông tin về mentors",
      response:
        "gzv Center có đội ngũ mentors giàu kinh nghiệm:\n\n⭐ 50+ mentors chuyên nghiệp\n🏢 Từ các công ty hàng đầu\n🎓 Kinh nghiệm 5-15 năm\n💡 Chuyên môn đa dạng",
    },
    {
      id: "support",
      text: "🔧 Hỗ trợ kỹ thuật",
      response:
        "Tôi có thể hỗ trợ bạn:\n\n🔐 Vấn đề đăng nhập\n📱 Lỗi trên mobile/desktop\n🎥 Không xem được video\n📊 Theo dõi tiến độ học\n💳 Thanh toán khóa học",
    },
  ]

  const botResponses = {
    greeting: [
      "Xin chào! Tôi có thể giúp gì cho bạn? 😊",
      "Chào bạn! Rất vui được hỗ trợ bạn hôm nay! 🌟",
      "Hello! Tôi là gzv Assistant, sẵn sàng giúp đỡ bạn! 🤖",
    ],
    thanks: [
      "Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn! 😊",
      "Rất vui được giúp đỡ bạn! Còn gì khác không? 🌟",
      "Cảm ơn bạn! Hãy liên hệ bất cứ khi nào cần hỗ trợ! 💙",
    ],
    default: [
      "Tôi hiểu bạn đang quan tâm về vấn đề này. Bạn có thể gọi hotline hoặc gửi email để được hỗ trợ chi tiết hơn.",
      "Cảm ơn bạn đã liên hệ! Tôi sẽ chuyển yêu cầu của bạn đến đội ngũ chuyên môn.",
      "Tôi đang học hỏi thêm để trả lời câu hỏi này tốt hơn! 🤖",
    ],
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const simulateTyping = () => {
    setIsTyping(true)
    setTimeout(() => setIsTyping(false), 1000 + Math.random() * 2000)
  }

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    if (message.includes("xin chào") || message.includes("hello") || message.includes("hi")) {
      return botResponses.greeting[Math.floor(Math.random() * botResponses.greeting.length)]
    }
    if (message.includes("cảm ơn") || message.includes("thanks") || message.includes("thank you")) {
      return botResponses.thanks[Math.floor(Math.random() * botResponses.thanks.length)]
    }
    return botResponses.default[Math.floor(Math.random() * botResponses.default.length)]
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    simulateTyping()

    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputMessage),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1500 + Math.random() * 1500)
  }

  const handleQuickReply = (reply: QuickReply) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: reply.text,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    simulateTyping()
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: reply.response,
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    }, 1000)
  }

  const resetChat = () => {
    setMessages([
      {
        id: "welcome",
        text: "Xin chào! Tôi là gzv Assistant 🤖\n\nTôi có thể giúp bạn:\n• Tìm hiểu về các khóa học\n• Thông tin về mentors\n• Hỗ trợ kỹ thuật\n• Tư vấn lộ trình học tập",
        sender: "bot",
        timestamp: new Date(),
      },
    ])
  }

  return (
    <motion.div
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      className="w-[20rem] max-w-[90vw] sm:w-[18rem]"
      style={{
    height: isMinimized ? "60px" : "500px",
    transition: "height 0.3s ease-out",
  }}


    >
      <Card className="h-full flex flex-col shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl overflow-hidden rounded-2xl">
        <CardHeader
          className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 flex-shrink-0 cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bot className="h-6 w-6" />
              <div>
                <div className="font-semibold">gzv Assistant</div>
                <div className="text-xs text-blue-100">Trực tuyến</div>
              </div>
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={resetChat} className="text-white hover:bg-white/20 h-8 w-8">
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/20 h-8 w-8">
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-8 w-8">
                <X className="h-4 w-4" />
                           </Button>
            </div>
          </div>
        </CardHeader>

        {/* Nội dung chat */}
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex-1 flex flex-col min-h-0"
            >
              <CardContent className="flex-1 flex flex-col p-0 min-h-0">
                {/* Tin nhắn */}
                <ScrollArea className="flex-1 p-4 space-y-3 overflow-y-auto">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-xl text-sm whitespace-pre-line ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 dark:text-white"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="text-xs text-gray-400 dark:text-gray-500 italic">Đang phản hồi...</div>
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Quick Replies */}
                <div className="px-4 pt-2 pb-1 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {quickReplies.map((reply) => (
                      <Button
                        key={reply.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickReply(reply)}
                        className="text-sm"
                      >
                        {reply.text}
                      </Button>
                    ))}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Nhập tin nhắn..."
                      className="flex-1"
                    />
                    <Button type="submit" size="icon" className="bg-blue-600 text-white hover:bg-blue-700">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

export default Chatbot