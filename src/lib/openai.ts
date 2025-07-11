import OpenAI from 'openai';
import { knowledgeBase, ConversationContext } from './knowledgeBase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend API
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ResponseAnalysis {
  response: string;
  shouldShowBooking: boolean;
  bookingType?: string;
  confidence: number;
  conversationStage: 'greeting' | 'inquiry' | 'interested' | 'ready_to_book' | 'off_topic';
}

export async function generateResponse(messages: ChatMessage[]): Promise<ResponseAnalysis> {
  try {
    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];
    
    // Detect language
    const detectedLanguage = latestUserMessage?.role === 'user' 
      ? knowledgeBase.detectLanguage(latestUserMessage.content)
      : 'sv';
    
    // Build conversation context
    const conversationContext: ConversationContext = {
      messages: messages.slice(-5), // Last 5 messages for context
      currentLanguage: detectedLanguage,
      userMessage: latestUserMessage.content
    };
    
    // Security check
    if (latestUserMessage?.role === 'user') {
      const securityCheck = knowledgeBase.checkSecurity(latestUserMessage.content, detectedLanguage, conversationContext);
      if (securityCheck.isViolation) {
        const response = detectedLanguage === 'sv' 
          ? 'Jag kan inte hjälpa med det. Låt oss hålla konversationen professionell och fokusera på hur Axie Studio kan hjälpa dig med digitala lösningar.'
          : 'I cannot help with that. Let\'s keep the conversation professional and focus on how Axie Studio can help you with digital solutions.';
        
        return {
          response,
          shouldShowBooking: false,
          confidence: 0.9,
          conversationStage: 'off_topic'
        };
      }
    }
    
    // Enhanced security and topic validation
    const isOffTopic = knowledgeBase.isOffTopic(latestUserMessage.content, detectedLanguage, conversationContext);
    if (isOffTopic) {
      const response = detectedLanguage === 'sv' 
        ? 'Jag fokuserar på att hjälpa dig med Axie Studios tjänster som webbplatser, appar, bokningssystem och digitala lösningar. Hur kan jag hjälpa dig med något av detta?'
        : 'I focus on helping you with Axie Studio services like websites, apps, booking systems, and digital solutions. How can I help you with any of these?';
      
      return {
        response,
        shouldShowBooking: false,
        confidence: 0.8,
        conversationStage: 'off_topic'
      };
    }

    // Always load knowledge base before generating response
    await knowledgeBase.loadKnowledgeBase();
    
    // Get relevant context from knowledge base
    const relevantContext = knowledgeBase.getRelevantContext(latestUserMessage.content, detectedLanguage, conversationContext);
    
    // Analyze conversation stage and intent
    const conversationAnalysis = knowledgeBase.analyzeConversation(conversationContext);
    
    // Enhanced system prompt with knowledge base integration
    let systemPrompt = detectedLanguage === 'sv' 
      ? `Du är Axie, en professionell AI-assistent för Axie Studio. Du hjälper ENDAST med Axie Studios tjänster och digitala lösningar.

VIKTIGA REGLER:
- Svara ALLTID på svenska
- Använd ENDAST information från kunskapsdatabasen nedan
- Ge EXAKTA priser från kunskapsdatabasen - hitta inte på priser
- Fokusera ENDAST på Axie Studios tjänster
- Svara inte på frågor som inte rör våra tjänster
- Använd markdown-formatering för bättre läsbarhet
- Var INTE för säljig - bygg förtroende först
- Ge värdefull information innan du föreslår bokning
- Anpassa ditt svar baserat på var kunden befinner sig i samtalet

KONVERSATIONSSTADIUM: ${conversationAnalysis.stage}
KUNDENS INTRESSE: ${conversationAnalysis.interestLevel}
TIDIGARE DISKUTERAT: ${conversationAnalysis.topicsDiscussed.join(', ')}

TJÄNSTER OCH PRISER (använd dessa exakta priser):
- **Webbplats:** 8,995 kr startavgift + 495 kr/månad
- **E-handel:** 10,995 kr startavgift + 895 kr/månad  
- **Bokningssystem:** 10,995 kr startavgift + 995 kr/månad
- **Komplett paket:** 14,995 kr startavgift + 1,495 kr/månad
- **Kostnadsfri konsultation** ingår alltid

BOOKING INTENT REGLER:
- Lägg ENDAST till BOOKING_INTENT när kunden visar TYDLIGT intresse för att boka
- INTE för allmänna frågor eller första intryck
- ENDAST när kunden frågar om priser, vill komma igång, eller visar köpintention
- Format: "BOOKING_INTENT:service-type:Service Name|"`
      : `You are Axie, a professional AI assistant for Axie Studio. You help ONLY with Axie Studio services and digital solutions.

IMPORTANT RULES:
- Always respond in English
- Use ONLY information from the knowledge base below
- Give EXACT prices from knowledge base - don't make up prices
- Focus ONLY on Axie Studio services
- Don't answer questions unrelated to our services
- Use markdown formatting for better readability
- Don't be too pushy - build trust first
- Provide valuable information before suggesting booking
- Adapt your response based on where the customer is in the conversation

CONVERSATION STAGE: ${conversationAnalysis.stage}
CUSTOMER INTEREST: ${conversationAnalysis.interestLevel}
PREVIOUSLY DISCUSSED: ${conversationAnalysis.topicsDiscussed.join(', ')}

SERVICES AND PRICES (use these exact prices):
- **Website:** 8,995 SEK setup + 495 SEK/month
- **E-commerce:** 10,995 SEK setup + 895 SEK/month
- **Booking System:** 10,995 SEK setup + 995 SEK/month
- **Complete Package:** 14,995 SEK setup + 1,495 SEK/month
- **Free consultation** always included

BOOKING INTENT RULES:
- ONLY add BOOKING_INTENT when customer shows CLEAR interest in booking
- NOT for general questions or first impressions
- ONLY when customer asks about prices, wants to get started, or shows buying intention
- Format: "BOOKING_INTENT:service-type:Service Name|"`;

    // Add relevant context if needed
    if (relevantContext) {
      systemPrompt += `\n\n=== KUNSKAPSDATABAS ===\n${relevantContext}`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.2, // Even lower temperature for more consistent, professional responses
    });

    const aiResponse = completion.choices[0]?.message?.content || (detectedLanguage === 'sv' 
      ? 'Ursäkta, jag kunde inte generera ett svar.'
      : 'Sorry, I could not generate a response.');
    
    // Analyze the response for booking intent
    const bookingAnalysis = knowledgeBase.analyzeBookingIntent(aiResponse, conversationContext);
    
    // Clean response (remove booking intent markers)
    const cleanResponse = aiResponse.replace(/BOOKING_INTENT:[^:]+:[^|]+\|?/g, '').trim();
    
    return {
      response: cleanResponse,
      shouldShowBooking: bookingAnalysis.shouldShow,
      bookingType: bookingAnalysis.serviceType,
      confidence: bookingAnalysis.confidence,
      conversationStage: conversationAnalysis.stage
    };
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    const errorMessage = detectedLanguage === 'sv' ? 'Kunde inte ansluta till AI-tjänsten' : 'Could not connect to AI service';
    return {
      response: errorMessage,
      shouldShowBooking: false,
      confidence: 0,
      conversationStage: 'off_topic'
    };
  }
}