# ASTI AI Implementation Plan

This document outlines the step-by-step plan for implementing and enhancing ASTI's AI capabilities according to Matt's requirements.

## Phase 1: Enhanced SpeakToMe Dialog

### 1.1 Create EmailAIDialog Component

Create a new component that provides email context within the AI conversation:

```tsx
// src/components/Conversation/EmailAIDialog.tsx
import React from 'react';
import { Box, Grid, Divider, Paper, Typography } from '@mui/material';
import { SpeakToMe } from './SpeakToMe';
import { EmailDetail } from '@/components/Email/EmailDetail';
import { useEmailContext } from '@/contexts/EmailContext';
import type { EmailMessage } from '@/types/email';

interface EmailAIDialogProps {
  open: boolean;
  onClose: () => void;
  email?: EmailMessage;
}

export const EmailAIDialog: React.FC<EmailAIDialogProps> = ({ 
  open, 
  onClose, 
  email 
}) => {
  const { selectedEmail } = useEmailContext();
  const activeEmail = email || selectedEmail;

  return (
    <Grid container sx={{ height: '100%' }}>
      {/* Left Panel - Email Content */}
      <Grid item xs={12} md={5} lg={4}>
        <Paper 
          elevation={0} 
          sx={{ 
            height: '100%', 
            borderRight: '1px solid', 
            borderColor: 'divider',
            overflow: 'auto' 
          }}
        >
          {activeEmail ? (
            <EmailDetail email={activeEmail} isPreview />
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No email selected. The AI can still help you with general questions.
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>

      {/* Right Panel - AI Chat */}
      <Grid item xs={12} md={7} lg={8}>
        <SpeakToMe 
          open={open} 
          onClose={onClose} 
          contextEmail={activeEmail}
        />
      </Grid>
    </Grid>
  );
};
```

### 1.2 Update SpeakToMe Component

Enhance the SpeakToMe component to accept and incorporate email context:

```tsx
// Updated SpeakToMe.tsx props interface
interface SpeakToMeProps {
  open: boolean;
  onClose: () => void;
  contextEmail?: EmailMessage;
}

// Update component to use contextual email in prompts
// Inside the component:
const generatePromptWithContext = (userText: string, email?: EmailMessage) => {
  if (!email) return userText;
  
  // Create a prompt that includes email context
  return `
    I'm looking at this email:
    From: ${email.sender}
    Subject: ${email.subject}
    Date: ${new Date(email.date).toLocaleString()}
    
    Email content:
    ${email.content.slice(0, 1000)}${email.content.length > 1000 ? '...' : ''}
    
    My question/request: ${userText}
  `;
};

// Use in handleSendMessage
const handleSendMessage = () => {
  if (!inputText.trim()) return;
  
  const text = inputText.trim();
  const contextualPrompt = generatePromptWithContext(text, contextEmail);
  
  addUserMessage(text); // Show user's original message in UI
  sendMessageToAI(contextualPrompt); // Send message with context to AI
  
  setInputText('');
};
```

### 1.3 Add Suggestions Based on Email Context

Implement contextual suggestions in the SpeakToMe dialog:

```tsx
// Add to SpeakToMe component
const [suggestions, setSuggestions] = useState<string[]>([]);

// Generate suggestions based on email context
useEffect(() => {
  if (contextEmail && open) {
    // Generate default suggestions based on email type
    const basePrompt = `
      This is an email:
      From: ${contextEmail.sender}
      Subject: ${contextEmail.subject}
      Content: ${contextEmail.content.slice(0, 500)}...
      
      Generate 3 short, helpful actions I might want to take with this email.
      Format as JSON array of strings, each under 10 words.
    `;
    
    // Call AI service to get suggestions
    aiService.generateSuggestions(basePrompt)
      .then(result => {
        setSuggestions(result);
      })
      .catch(err => {
        console.error('Error generating suggestions:', err);
        // Fallback suggestions
        setSuggestions([
          "Reply to this email",
          "Summarize key points",
          "Find related emails"
        ]);
      });
  }
}, [contextEmail, open]);

// Render suggestions in UI
const renderSuggestions = () => (
  <Box sx={{ mt: 2, mb: 2 }}>
    {suggestions.map((suggestion, index) => (
      <Button
        key={index}
        variant="outlined"
        size="small"
        onClick={() => {
          setInputText(suggestion);
          handleSendMessage();
        }}
        sx={{ mr: 1, mb: 1 }}
      >
        {suggestion}
      </Button>
    ))}
  </Box>
);
```

### 1.4 Update DashboardContext

Enhance the DashboardContext to handle email context:

```tsx
// src/contexts/DashboardContext.tsx
import { EmailMessage } from '@/types/email';

interface DashboardContextValue {
  openSpeakToMe: (email?: EmailMessage) => void;
  closeSpeakToMe: () => void;
  isSpeakToMeOpen: boolean;
  contextEmail: EmailMessage | null;
}

// Provider component
export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [isSpeakToMeOpen, setIsSpeakToMeOpen] = useState(false);
  const [contextEmail, setContextEmail] = useState<EmailMessage | null>(null);

  const openSpeakToMe = (email?: EmailMessage) => {
    setContextEmail(email || null);
    setIsSpeakToMeOpen(true);
  };

  const closeSpeakToMe = () => {
    setIsSpeakToMeOpen(false);
    // Optionally clear context after dialog closes
    // setContextEmail(null);
  };

  return (
    <DashboardContext.Provider
      value={{
        openSpeakToMe,
        closeSpeakToMe,
        isSpeakToMeOpen,
        contextEmail,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};
```

### 1.5 Update Dashboard and EmailDashboard Components

Ensure the Ask ASTI button passes email context:

```tsx
// In EmailDashboard.tsx or similar component
const handleAskASTI = (email: EmailMessage) => {
  openSpeakToMe(email);
};

// In component JSX
<ActionButtons 
  type="email"
  onDoItNow={handleDoItNow}
  onDefer={handleDefer}
  onAskASTI={() => handleAskASTI(email)}
/>
```

## Phase 2: Central AI Service with Vector Memory

### 2.1 Create Core AI Service

Create a unified AI service that all components can use:

```tsx
// src/services/ai/ASTIBrain.ts
import { OpenAI } from 'openai';
import { EmailMessage } from '@/types/email';
import { VectorMemory } from './VectorMemory';
import { KnowledgeGraph } from './KnowledgeGraph';

interface AIContext {
  email?: EmailMessage;
  selectedTasks?: string[];
  userPreferences?: Record<string, any>;
}

export class ASTIBrain {
  private openai: OpenAI;
  private vectorMemory: VectorMemory;
  private knowledgeGraph: KnowledgeGraph;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.vectorMemory = new VectorMemory();
    this.knowledgeGraph = new KnowledgeGraph();
  }
  
  // Generate a response with context
  async generateResponse(
    userInput: string, 
    conversation: { role: 'user' | 'assistant'; content: string }[],
    context?: AIContext
  ) {
    // 1. Retrieve relevant memories
    const relevantMemories = await this.vectorMemory.retrieveSimilar(userInput);
    
    // 2. Build knowledge graph context
    const graphContext = context?.email 
      ? await this.knowledgeGraph.getRelatedNodes(context.email)
      : [];
      
    // 3. Construct the prompt with all context
    const systemPrompt = `
      You are ASTI, an AI assistant designed to help neurodivergent individuals.
      
      Current context:
      ${context?.email ? `
        Email from: ${context.email.sender}
        Subject: ${context.email.subject}
        Content: ${context.email.content.slice(0, 500)}...
      ` : 'No specific email context.'}
      
      Relevant memories:
      ${relevantMemories.map(m => '- ' + m).join('\n')}
      
      Knowledge graph context:
      ${graphContext.map(g => '- ' + g).join('\n')}
      
      Respond helpfully, concisely, and with empathy.
    `;
    
    // 4. Call OpenAI API with all context
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation,
    ];
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 500,
    });
    
    // 5. Store this interaction in memory
    await this.vectorMemory.storeMemory(
      userInput, 
      response.choices[0].message.content || '', 
      context
    );
    
    return response.choices[0].message.content;
  }
  
  // Generate email reply options
  async generateReplyOptions(email: EmailMessage, style: 'authentic' | 'masked' | 'simple' = 'authentic') {
    const prompt = `
      Email from: ${email.sender}
      Subject: ${email.subject}
      Content: ${email.content}
      
      Generate a ${style} style reply to this email.
      
      ${style === 'authentic' ? 'Write as the authentic self, with direct honesty.' : ''}
      ${style === 'masked' ? 'Write in a professional, neurotypical-friendly style.' : ''}
      ${style === 'simple' ? 'Write in a simple, low-cognitive-load style for ease of processing.' : ''}
      
      Create 3 options:
      1. Full reply
      2. Brief acknowledgment
      3. Request for more time
      
      Format as JSON with keys: full, brief, needTime
    `;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You generate email replies in JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
    });
    
    try {
      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (e) {
      console.error('Failed to parse reply options:', e);
      return {
        full: 'Thank you for your email. I'll get back to you soon.',
        brief: 'Got it, thanks!',
        needTime: 'I've received your email and need a bit more time to respond properly.'
      };
    }
  }
}
```

### 2.2 Implement Vector Memory

```tsx
// src/services/ai/VectorMemory.ts
import { ChromaClient, OpenAIEmbeddingFunction } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';

interface Memory {
  id: string;
  text: string;
  metadata: Record<string, any>;
}

export class VectorMemory {
  private client: ChromaClient;
  private embedder: OpenAIEmbeddingFunction;
  private collection: any; // TypeScript definition for Chroma collection
  
  constructor() {
    // For development, use in-memory ChromaDB
    this.client = new ChromaClient();
    this.embedder = new OpenAIEmbeddingFunction({ openai_api_key: process.env.OPENAI_API_KEY });
    
    // Initialize collection
    this.initializeCollection();
  }
  
  private async initializeCollection() {
    try {
      // Get or create collection for user memories
      this.collection = await this.client.getOrCreateCollection({
        name: 'user_memories',
        embeddingFunction: this.embedder,
      });
      
      console.log('ChromaDB collection initialized');
    } catch (error) {
      console.error('Failed to initialize ChromaDB collection:', error);
      
      // Fallback to using local storage for development
      console.warn('Using localStorage fallback for vector memory');
    }
  }
  
  async storeMemory(input: string, output: string, context?: any): Promise<string> {
    const id = uuidv4();
    const combinedText = `User: ${input}\nASTI: ${output}`;
    const metadata = { 
      timestamp: new Date().toISOString(),
      ...context ? { 
        hasEmailContext: !!context.email,
        emailSender: context.email?.sender,
        emailSubject: context.email?.subject,
      } : {}
    };
    
    try {
      if (this.collection) {
        await this.collection.add({
          ids: [id],
          documents: [combinedText],
          metadatas: [metadata],
        });
      } else {
        // Fallback to localStorage
        const memories = JSON.parse(localStorage.getItem('asti_memories') || '[]');
        memories.push({ id, text: combinedText, metadata });
        localStorage.setItem('asti_memories', JSON.stringify(memories));
      }
      
      console.log('Stored new memory:', id);
      return id;
    } catch (error) {
      console.error('Failed to store memory:', error);
      return id; // Return ID even if storage failed
    }
  }
  
  async retrieveSimilar(query: string, limit = 5): Promise<string[]> {
    try {
      if (this.collection) {
        const results = await this.collection.query({
          queryTexts: [query],
          nResults: limit,
        });
        
        return results.documents[0];
      } else {
        // Fallback to localStorage - simple keyword matching
        const memories = JSON.parse(localStorage.getItem('asti_memories') || '[]');
        
        // Naive matching using keywords
        const keywords = query.toLowerCase().split(/\s+/);
        const rankedMemories = memories.map((memory: Memory) => {
          const score = keywords.reduce((count: number, word: string) => {
            return count + (memory.text.toLowerCase().includes(word) ? 1 : 0);
          }, 0);
          return { memory, score };
        });
        
        // Sort by score and take top matches
        return rankedMemories
          .sort((a: any, b: any) => b.score - a.score)
          .slice(0, limit)
          .map((item: any) => item.memory.text);
      }
    } catch (error) {
      console.error('Failed to retrieve memories:', error);
      return [];
    }
  }
}
```

### 2.3 Implement Knowledge Graph (Basic Version)

```tsx
// src/services/ai/KnowledgeGraph.ts
import { EmailMessage } from '@/types/email';

export class KnowledgeGraph {
  private emailRelations: Map<string, string[]>;
  
  constructor() {
    // For development, use in-memory storage
    this.emailRelations = new Map();
    
    // Load from localStorage if exists
    this.loadFromLocalStorage();
  }
  
  private loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('asti_knowledge_graph');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.emailRelations = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load knowledge graph from localStorage:', error);
    }
  }
  
  private saveToLocalStorage() {
    try {
      const obj = Object.fromEntries(this.emailRelations);
      localStorage.setItem('asti_knowledge_graph', JSON.stringify(obj));
    } catch (error) {
      console.error('Failed to save knowledge graph to localStorage:', error);
    }
  }
  
  // Store a relationship between two emails
  addEmailRelation(email1Id: string, email2Id: string, relationType: string) {
    const key = `${email1Id}:${relationType}`;
    const existing = this.emailRelations.get(key) || [];
    if (!existing.includes(email2Id)) {
      this.emailRelations.set(key, [...existing, email2Id]);
      this.saveToLocalStorage();
    }
  }
  
  // Retrieve relationships for an email
  async getRelatedNodes(email: EmailMessage): Promise<string[]> {
    const relationships: string[] = [];
    
    // Get thread relationships
    const threadKey = `${email.id}:thread`;
    const threadEmails = this.emailRelations.get(threadKey) || [];
    if (threadEmails.length > 0) {
      relationships.push(`Email is part of a thread with ${threadEmails.length} other messages`);
    }
    
    // Get topic relationships
    const topicKey = `${email.id}:topic`;
    const topicEmails = this.emailRelations.get(topicKey) || [];
    if (topicEmails.length > 0) {
      relationships.push(`Email is related to ${topicEmails.length} other emails by topic`);
    }
    
    // Get sender frequency
    const senderKey = `sender:${email.sender}`;
    const senderEmails = this.emailRelations.get(senderKey) || [];
    if (senderEmails.length > 0) {
      relationships.push(`You have ${senderEmails.length} other emails from ${email.sender}`);
    }
    
    return relationships;
  }
  
  // Process a new email to find relationships
  async processNewEmail(email: EmailMessage): Promise<void> {
    // Add to sender index
    const senderKey = `sender:${email.sender}`;
    const senderEmails = this.emailRelations.get(senderKey) || [];
    this.emailRelations.set(senderKey, [...senderEmails, email.id]);
    
    // For a real implementation, would do more sophisticated analysis
    // For now, just save changes
    this.saveToLocalStorage();
  }
}
```

## Phase 3: Auto-Reply System

### 3.1 Create Auto-Reply Component

```tsx
// src/components/Email/AutoReplyDialog.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Paper
} from '@mui/material';
import { EmailMessage } from '@/types/email';
import { ASTIBrain } from '@/services/ai/ASTIBrain';

interface AutoReplyDialogProps {
  open: boolean;
  onClose: () => void;
  email: EmailMessage;
  onSendReply: (content: string) => Promise<void>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reply-tabpanel-${index}`}
      aria-labelledby={`reply-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const AutoReplyDialog: React.FC<AutoReplyDialogProps> = ({
  open,
  onClose,
  email,
  onSendReply
}) => {
  const [loading, setLoading] = useState(true);
  const [replyOptions, setReplyOptions] = useState<Record<string, string>>({
    full: '',
    brief: '',
    needTime: ''
  });
  const [customizedReply, setCustomizedReply] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [replyStyle, setReplyStyle] = useState<'authentic' | 'masked' | 'simple'>('authentic');
  const [sending, setSending] = useState(false);
  
  const astiBrain = new ASTIBrain();
  
  // Generate reply options when dialog opens or style changes
  useEffect(() => {
    const generateOptions = async () => {
      if (!open) return;
      
      setLoading(true);
      try {
        const options = await astiBrain.generateReplyOptions(email, replyStyle);
        setReplyOptions(options);
        setCustomizedReply(options.full); // Start with full reply
      } catch (error) {
        console.error('Error generating reply options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    generateOptions();
  }, [open, email, replyStyle]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Update customized reply based on selected tab
    if (newValue === 0) setCustomizedReply(replyOptions.full);
    if (newValue === 1) setCustomizedReply(replyOptions.brief);
    if (newValue === 2) setCustomizedReply(replyOptions.needTime);
  };
  
  const handleSendReply = async () => {
    if (!customizedReply.trim()) return;
    
    setSending(true);
    try {
      await onSendReply(customizedReply);
      onClose();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setSending(false);
    }
  };
  
  const handleStyleChange = (style: 'authentic' | 'masked' | 'simple') => {
    setReplyStyle(style);
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Auto-Reply to: {email.subject}
      </DialogTitle>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {/* Email summary */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" color="text.secondary">From: {email.sender}</Typography>
              <Typography variant="subtitle1" gutterBottom>{email.subject}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                maxHeight: '100px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis' 
              }}>
                {email.content.slice(0, 200)}...
              </Typography>
            </Paper>
            
            {/* Reply style selector */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>Select your communication style:</Typography>
              <Box display="flex" gap={2}>
                <Button 
                  variant={replyStyle === 'authentic' ? 'contained' : 'outlined'}
                  onClick={() => handleStyleChange('authentic')}
                  sx={{ flex: 1 }}
                >
                  🧠 Authentic You
                </Button>
                <Button 
                  variant={replyStyle === 'masked' ? 'contained' : 'outlined'}
                  onClick={() => handleStyleChange('masked')}
                  sx={{ flex: 1 }}
                >
                  🎭 Professional Masking
                </Button>
                <Button 
                  variant={replyStyle === 'simple' ? 'contained' : 'outlined'}
                  onClick={() => handleStyleChange('simple')}
                  sx={{ flex: 1 }}
                >
                  💬 Cognitive Ease
                </Button>
              </Box>
            </Box>
            
            {/* Reply options tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="Full Reply" />
                <Tab label="Brief Acknowledgment" />
                <Tab label="Need More Time" />
              </Tabs>
            </Box>
            
            <TabPanel value={activeTab} index={0}>
              <TextField
                label="Edit your reply"
                multiline
                rows={10}
                fullWidth
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
            
            <TabPanel value={activeTab} index={1}>
              <TextField
                label="Brief acknowledgment"
                multiline
                rows={4}
                fullWidth
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
            
            <TabPanel value={activeTab} index={2}>
              <TextField
                label="Request more time"
                multiline
                rows={6}
                fullWidth
                value={customizedReply}
                onChange={(e) => setCustomizedReply(e.target.value)}
                variant="outlined"
              />
            </TabPanel>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={sending}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSendReply} 
          disabled={loading || sending || !customizedReply.trim()}
          endIcon={sending ? <CircularProgress size={20} /> : undefined}
        >
          {sending ? 'Sending...' : 'Send Reply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### 3.2 Update ActionButtons for Email Reply

Update the ActionButtons component to handle auto-reply:

```tsx
// In EmailDashboard.tsx or similar component
const handleAutoReply = (email: EmailMessage) => {
  setReplyEmail(email);
  setAutoReplyOpen(true);
};

// Add to component state
const [replyEmail, setReplyEmail] = useState<EmailMessage | null>(null);
const [autoReplyOpen, setAutoReplyOpen] = useState(false);

// Add to JSX
<ActionButtons 
  type="email"
  onDoItNow={handleDoItNow}
  onDefer={handleDefer}
  onAskASTI={() => handleAskASTI(email)}
  onAutoReply={() => handleAutoReply(email)}
  showAutoReply={true}
/>

{replyEmail && (
  <AutoReplyDialog
    open={autoReplyOpen}
    onClose={() => setAutoReplyOpen(false)}
    email={replyEmail}
    onSendReply={async (content) => {
      // Handle reply sending
      await emailService.sendReply(replyEmail.id, content);
      // Update email list
      refreshEmails();
    }}
  />
)}
```

## Phase 4: Improve Daily Brief with Memory

### 4.1 Update AIService for Daily Brief

```tsx
// src/services/ai/aiService.ts
// Add method to generate daily brief with memory

async generateDailyBrief(emails: EmailMessage[]): Promise<DailyBriefData> {
  // Get relevant memories
  const memories = await this.vectorMemory.retrieveSimilar(
    "Generate a daily brief about my emails and tasks", 
    3
  );
  
  // Get upcoming calendar events
  const events = await calendarService.getUpcomingEvents();
  
  // Format emails summary
  const emailSummary = emails
    .slice(0, 5)
    .map(e => `- ${e.subject} from ${e.sender}`)
    .join('\n');
  
  // Build prompt with context
  const prompt = `
    Generate a daily brief for the user. Include:
    
    1. A summary of their emails
    2. Action items they should address
    3. A stress assessment based on email content
    
    Current emails:
    ${emailSummary}
    
    Upcoming events:
    ${events.map(e => `- ${e.title} on ${e.start}`).join('\n')}
    
    Previous activity (for context):
    ${memories.join('\n')}
    
    Format your response as JSON with these keys:
    - greeting: a personal greeting for the time of day
    - emailSummary: summary of their emails
    - actionNeeded: list of actions they should take
    - wellbeingTip: a suggestion for maintaining well-being
    - stressAssessment: assessment of their current stress level
  `;
  
  // Call OpenAI
  const response = await this.openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You generate personalized daily briefs.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
  });
  
  try {
    // Parse and return
    return JSON.parse(response.choices[0].message.content || '{}');
  } catch (error) {
    console.error('Failed to parse daily brief:', error);
    // Return fallback data
    return {
      greeting: 'Good day!',
      emailSummary: 'You have several unread emails to review.',
      actionNeeded: ['Check your inbox', 'Reply to urgent messages'],
      wellbeingTip: 'Remember to take regular breaks today.',
      stressAssessment: 'MEDIUM',
    };
  }
}
```

### 4.2 Update DailyBrief Component

```tsx
// src/components/Dashboard/DailyBrief.tsx
// Update the component to use the new AI service

// Add to imports
import { ASTIBrain } from '@/services/ai/ASTIBrain';

// Inside the component:
const [loading, setLoading] = useState(true);
const [briefData, setBriefData] = useState<DailyBriefData | null>(null);
const { emails } = useEmailContext();
const astiBrain = useMemo(() => new ASTIBrain(), []);

// Fetch the daily brief
useEffect(() => {
  const fetchDailyBrief = async () => {
    setLoading(true);
    try {
      const data = await astiBrain.generateDailyBrief(emails);
      setBriefData(data);
    } catch (error) {
      console.error('Error fetching daily brief:', error);
      // Set fallback data
    } finally {
      setLoading(false);
    }
  };
  
  fetchDailyBrief();
}, [emails, astiBrain]);
```

## Next Steps and Timeline

### Immediate Tasks (1-2 weeks)

1. Fix SpeakToMe dialog with email context view
2. Set up basic vector memory (localStorage implementation)
3. Implement auto-reply workflow
4. Standardize AI service across components

### Near Future (3-4 weeks)

1. Implement Chrome persistence layer
2. Create knowledge graph foundation
3. Update Daily Brief with memory
4. Add memory tracking (what ASTI knows)

### Medium Term (2-3 months)

1. Implement Neo4j knowledge graph
2. Add proper embedding/vector DB hosting
3. Create task completion tracking
4. Add UI polish and animations

## Testing Strategy

1. Create mock modules for all AI services in dev environment
2. Set up integration tests for frontend-to-backend AI calls
3. Develop component tests for AI UI components
4. Establish end-to-end tests for key AI workflows 