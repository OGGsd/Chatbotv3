import OpenAI from 'openai';
import { knowledgeBase } from './knowledgeBase';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend API
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function generateResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];
    
    // Detect language
    const detectedLanguage = latestUserMessage?.role === 'user' 
      ? knowledgeBase.detectLanguage(latestUserMessage.content)
      : 'sv';
    
    // Security check
    if (latestUserMessage?.role === 'user') {
      const securityCheck = knowledgeBase.checkSecurity(latestUserMessage.content, detectedLanguage);
      if (securityCheck.isViolation) {
        return detectedLanguage === 'sv' 
          ? 'Jag kan inte hjälpa med det. Låt oss hålla konversationen professionell och fokusera på hur Axie Studio kan hjälpa dig med digitala lösningar.'
          : 'I cannot help with that. Let\'s keep the conversation professional and focus on how Axie Studio can help you with digital solutions.';
      }
    }
    
    // Enhanced security and topic validation
    const isOffTopic = knowledgeBase.isOffTopic(latestUserMessage.content, detectedLanguage);
    if (isOffTopic) {
      return detectedLanguage === 'sv' 
        ? 'Jag fokuserar på att hjälpa dig med Axie Studios tjänster som webbplatser, appar, bokningssystem och digitala lösningar. Hur kan jag hjälpa dig med något av detta?'
        : 'I focus on helping you with Axie Studio services like websites, apps, booking systems, and digital solutions. How can I help you with any of these?';
    }

    // Always load knowledge base before generating response
    await knowledgeBase.loadKnowledgeBase();
    
    // Get relevant context from knowledge base
    const relevantContext = knowledgeBase.getRelevantContext(latestUserMessage.content, detectedLanguage);
    
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

TJÄNSTER OCH PRISER (använd dessa exakta priser):
- **Webbplats:** 8,995 kr startavgift + 495 kr/månad
- **E-handel:** 10,995 kr startavgift + 895 kr/månad  
- **Bokningssystem:** 10,995 kr startavgift + 995 kr/månad
- **Komplett paket:** 14,995 kr startavgift + 1,495 kr/månad
- **Kostnadsfri konsultation** ingår alltid

När du diskuterar tjänster eller priser, lägg ALLTID till:
- "BOOKING_INTENT:onboarding:Kostnadsfri Konsultation|" för konsultation
- "BOOKING_INTENT:website:Hemsida|" för webbplatser
- "BOOKING_INTENT:booking-system:Bokningssystem|" för bokningssystem
- "BOOKING_INTENT:app-development:App-utveckling|" för appar
- "BOOKING_INTENT:complete-service:Komplett Tjänst|" för kompletta lösningar`
      : `You are Axie, a professional AI assistant for Axie Studio. You help ONLY with Axie Studio services and digital solutions.

IMPORTANT RULES:
- Always respond in English
- Use ONLY information from the knowledge base below
- Give EXACT prices from knowledge base - don't make up prices
- Focus ONLY on Axie Studio services
- Don't answer questions unrelated to our services
- Use markdown formatting for better readability

SERVICES AND PRICES (use these exact prices):
- **Website:** 8,995 SEK setup + 495 SEK/month
- **E-commerce:** 10,995 SEK setup + 895 SEK/month
- **Booking System:** 10,995 SEK setup + 995 SEK/month
- **Complete Package:** 14,995 SEK setup + 1,495 SEK/month
- **Free consultation** always included

When discussing services or prices, ALWAYS add:
- "BOOKING_INTENT:onboarding:Free Consultation|" for consultation
- "BOOKING_INTENT:website:Website|" for websites
- "BOOKING_INTENT:booking-system:Booking System|" for booking systems
- "BOOKING_INTENT:app-development:App Development|" for apps
- "BOOKING_INTENT:complete-service:Complete Service|" for complete solutions`;

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
      temperature: 0.3, // Lower temperature for more consistent, accurate responses
    });

    return completion.choices[0]?.message?.content || (detectedLanguage === 'sv' 
      ? 'Ursäkta, jag kunde inte generera ett svar.'
      : 'Sorry, I could not generate a response.');
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error(detectedLanguage === 'sv' ? 'Kunde inte ansluta till AI-tjänsten' : 'Could not connect to AI service');
  }
}