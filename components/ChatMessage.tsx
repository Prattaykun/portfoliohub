import React, { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, User, ExternalLink } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  type?: "text" | "audio";
}

interface ChatMessageProps {
  message: Message;
}

// Custom Link Component for Markdown
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MarkdownLink = ({ href, children }: any) => {
  const isProjectOrSection = href?.includes("/project/") || href?.includes("#");

  if (isProjectOrSection) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-3 py-1 my-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors no-underline shadow-md"
      >
        {children}
        <ExternalLink size={14} />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-purple-400 hover:text-purple-300 underline"
    >
      {children}
    </a>
  );
};

const ChatMessage = memo(
  ({ message }: ChatMessageProps) => {
    const isUser = message.role === "user";

    return (
      <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
        <div
          className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isUser
                ? "bg-purple-600"
                : "bg-gradient-to-tr from-blue-500 to-cyan-500"
            }`}
          >
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>

          <div
            className={`rounded-2xl px-5 py-4 text-sm md:text-base leading-relaxed shadow-sm ${
              isUser
                ? "bg-purple-600/90 text-white rounded-tr-none"
                : "bg-[#1e232e] text-gray-100 rounded-tl-none border border-white/5"
            }`}
          >
            {message.role === "model" ? (
              <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/30 prose-pre:p-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm as any]}
                  components={{ a: MarkdownLink }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>
        </div>
      </div>
    );
  },
  (previousProps, nextProps) =>
    previousProps.message.id === nextProps.message.id &&
    previousProps.message.role === nextProps.message.role &&
    previousProps.message.content === nextProps.message.content &&
    previousProps.message.type === nextProps.message.type
);

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
