import React, { useEffect, useState } from 'react';
import { memoryService, MemoryType } from '../services/memoryService';
import { knowledgeGraphService } from '../services/knowledgeGraphService';
import { EmailMessage } from '../types/email';

interface ConversationMessage {
  text: string;
  sender: 'user' | 'assistant';
}

interface EmailAIDialogProps {
  open: boolean;
  onClose: () => void;
  email?: EmailMessage;
}

const EmailAIDialog: React.FC<EmailAIDialogProps> = ({ 
  open, 
  onClose, 
  email 
}) => {
  const [initialMessage, setInitialMessage] = useState<ConversationMessage | null>(null);

  useEffect(() => {
    if (email && open) {
      // Store email in memory when dialog opens
      const storeEmailContext = async () => {
        try {
          // Store email in vector memory
          const emailMemory = await memoryService.storeMemory({
            type: MemoryType.EMAIL,
            content: `Email from ${email.sender.name} (${email.sender.email})
Subject: ${email.subject}
Content: ${email.content}`,
            metadata: {
              sender: email.sender,
              subject: email.subject,
              timestamp: email.timestamp,
              is_read: email.is_read,
              priority: email.priority,
              stress_level: email.stress_level,
              sentiment_score: email.sentiment_score
            }
          });

          // Store in knowledge graph
          await knowledgeGraphService.upsertNode({
            id: emailMemory.id,
            type: MemoryType.EMAIL,
            content: emailMemory.content,
            timestamp: emailMemory.timestamp,
            metadata: {
              sender: email.sender,
              subject: email.subject,
              priority: email.priority,
              stress_level: email.stress_level,
              sentiment_score: email.sentiment_score
            }
          });

          // Set initial message for SpeakToMe
          setInitialMessage({
            text: `I'm looking at an email from ${email.sender.name} about "${email.subject}". How can I help you with this email?`,
            sender: 'assistant'
          });
        } catch (error) {
          console.error('Error storing email context:', error);
        }
      };

      storeEmailContext();
    }
  }, [email, open]);

  return (
    <div>
      {/* Existing dialog content */}
    </div>
  );
};

export default EmailAIDialog; 