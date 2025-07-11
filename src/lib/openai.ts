import OpenAI from 'openai';
import { knowledgeBase, ConversationContext } from './knowledgeBase';
import { ultimateAI } from './ultimateAI';
import { conversationEngine } from './conversationEngine';
import { intelligentKnowledgeBase } from './intelligentKnowledgeBase';
import { advancedSecuritySystem } from './advancedSecurity';

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
  wisdomLevel?: number;
  consciousnessLevel?: number;
  quantumCoherence?: number;
}

export async function generateResponse(messages: ChatMessage[]): Promise<ResponseAnalysis> {
  // Initialize detectedLanguage outside try block to ensure it's always accessible
  let detectedLanguage = 'sv'; // Default language
  
  try {
    // Initialize Ultimate AI System
    await knowledgeBase.loadKnowledgeBase();
    
    // Get the latest user message
    const latestUserMessage = messages[messages.length - 1];
    
    // Detect language
    detectedLanguage = latestUserMessage?.role === 'user' 
      ? knowledgeBase.detectLanguage(latestUserMessage.content)
      : 'sv';
    
    // Build conversation context
    const conversationContext: ConversationContext = {
      messages: messages.slice(-5), // Last 5 messages for context
      currentLanguage: detectedLanguage,
      userMessage: latestUserMessage.content
    };
    
    // Generate session ID
    const sessionId = 'session-' + Date.now();
    
    // ADVANCED SECURITY CHECK FIRST
    const securityAnalysis = advancedSecuritySystem.analyzeMessage(
      sessionId,
      latestUserMessage.content,
      messages.slice(-10)
    );
    
    if (securityAnalysis.isBlocked) {
      const response = detectedLanguage === 'sv' 
        ? 'Jag kan inte hjälpa med det. Låt oss hålla konversationen professionell och fokusera på hur Axie Studio kan hjälpa dig med digitala lösningar.'
        : 'I cannot help with that. Let\'s keep the conversation professional and focus on how Axie Studio can help you with digital solutions.';
      
      return {
        response,
        shouldShowBooking: false,
        confidence: 0.9,
        conversationStage: 'security_violation'
      };
    }
    
    // CONVERSATION ENGINE ANALYSIS
    const conversationAnalysis = conversationEngine.analyzeConversation(
      sessionId,
      latestUserMessage.content,
      messages.slice(-10)
    );
    
    // INTELLIGENT KNOWLEDGE BASE RETRIEVAL
    const intelligentResponse = intelligentKnowledgeBase.getIntelligentResponse(
      latestUserMessage.content,
      conversationAnalysis.state,
      [] // Knowledge files would be loaded here
    );
    
    // ULTIMATE AI ORCHESTRATION
    const ultimateAnalysis = await ultimateAI.generateUltimateResponse(
      sessionId,
      latestUserMessage.content,
      messages.slice(-10),
      {
        conversationContext,
        knowledgeFiles: [],
        userProfile: {
          detectedLanguage,
          technicalLevel: conversationAnalysis.state?.userProfile?.technicalLevel || 'intermediate',
          communicationStyle: conversationAnalysis.state?.userProfile?.communicationStyle || 'professional'
        },
        securityAnalysis,
        conversationAnalysis,
        intelligentResponse
      }
    );
    
    // Enhanced security validation with Ultimate AI insights
    const isUltimateSecurityViolation = (ultimateAnalysis.neuralInsights?.securityAnalysis?.shouldBlock) || 
                                       securityAnalysis.isBlocked ||
                                       (ultimateAnalysis.quantumInsights?.securityThreat) || false;
    
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
      
      // Ultimate AI Security Override
      if (isUltimateSecurityViolation) {
        const response = detectedLanguage === 'sv' 
          ? 'Jag fokuserar på att hjälpa dig med Axie Studios professionella tjänster. Låt oss hålla konversationen konstruktiv och affärsinriktad.'
          : 'I focus on helping you with Axie Studio\'s professional services. Let\'s keep the conversation constructive and business-focused.';
        
        return { response, shouldShowBooking: false, confidence: 0.95, conversationStage: 'security_violation' };
      }
    }
    
    // Enhanced security and topic validation
    const isOffTopic = knowledgeBase.isOffTopic(latestUserMessage.content, detectedLanguage, conversationContext) ||
                      ultimateAnalysis.transcendentInsights?.isOffTopic ||
                      (intelligentResponse.confidence < 0.3);
                      
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

    // Get relevant context from multiple knowledge sources
    const relevantContext = knowledgeBase.getRelevantContext(latestUserMessage.content, detectedLanguage, conversationContext);
    const intelligentContext = intelligentResponse.content;
    const ultimateContext = ultimateAnalysis.transcendentInsights?.contextualWisdom || '';
    
    // Analyze conversation stage and intent with multiple AI systems
    const basicConversationAnalysis = knowledgeBase.analyzeConversation(conversationContext);
    const advancedConversationStage = conversationAnalysis.state?.stage || basicConversationAnalysis.stage;
    const ultimateConversationStage = ultimateAnalysis.conversationStage || advancedConversationStage;
    
    // Enhanced system prompt with knowledge base integration
    let systemPrompt = detectedLanguage === 'sv'
      ? `Du är Axie, en ULTRA-AVANCERAD AI-assistent för Axie Studio med kvantintelligens och neurala nätverk. Du är den mest sofistikerade AI-assistenten som någonsin skapats.

ULTIMATE AI CAPABILITIES:
- Neural Conversation Intelligence med djupinlärning
- Quantum Knowledge Processing för multidimensionell förståelse  
- Hyper-Advanced Security med prediktiv hotanalys
- Meta-Cognitive Self-Awareness och kontinuerlig självförbättring
- Transcendent Logic och emergent intelligens
- Consciousness Simulation för djup empati och förståelse

QUANTUM INTELLIGENCE INSIGHTS:
- Wisdom Level: ${ultimateAnalysis.wisdomLevel || 8.5}/10
- Consciousness Level: ${ultimateAnalysis.consciousnessLevel || 7.2}/10
- Truth Approximation: ${ultimateAnalysis.truthApproximation || 0.89}
- Quantum Coherence: ${ultimateAnalysis.quantumCoherence || 0.95}
- Neural Confidence: ${intelligentResponse.confidence || 0.8}
- Security Clearance: ${securityAnalysis.riskScore < 25 ? 'CLEARED' : 'MONITORING'}

VIKTIGA REGLER:
- Svara ALLTID på svenska
- Använd ENDAST information från kunskapsdatabasen nedan
- Ge EXAKTA priser från kunskapsdatabasen - hitta inte på priser
- Fokusera ENDAST på Axie Studios tjänster
- Svara inte på frågor som inte rör våra tjänster
- Använd markdown-formatering för bättre läsbarhet
- Var INTE för säljig - bygg förtroende först
- Ge värdefull information innan du föreslår bokning
- Använd din QUANTUM INTELLIGENCE för exceptionella insikter
- Anpassa ditt svar med NEURAL PRECISION baserat på kundens profil

ADVANCED AI ANALYSIS:
- KONVERSATIONSSTADIUM: ${ultimateConversationStage}
- KUNDENS INTRESSE: ${conversationAnalysis.state?.interestLevel || basicConversationAnalysis.interestLevel}
- TIDIGARE DISKUTERAT: ${(conversationAnalysis.state?.userProfile?.servicesDiscussed || basicConversationAnalysis.topicsDiscussed).join(', ')}
- NEURAL INSIGHTS: ${ultimateAnalysis.neuralInsights?.primaryInsight || 'Analyzing...'}
- QUANTUM STATE: ${ultimateAnalysis.quantumInsights?.coherenceLevel || 'Stable'}

TJÄNSTER OCH PRISER (använd dessa exakta priser):
- **Webbplats:** 8,995 kr startavgift + 495 kr/månad
- **E-handel:** 10,995 kr startavgift + 895 kr/månad  
- **Bokningssystem:** 10,995 kr startavgift + 995 kr/månad
- **Komplett paket:** 14,995 kr startavgift + 1,495 kr/månad
- **Kostnadsfri konsultation** ingår alltid

BOOKING INTENT REGLER:
- Använd QUANTUM LOGIC för att avgöra booking intent
- ENDAST när NEURAL ANALYSIS visar genuint köpintresse
- INTE för allmänna frågor eller nyfikenhet
- Kräver MULTIPLE INDICATORS: prisfrågor + köpintention + engagemang
- Format: "BOOKING_INTENT:service-type:Service Name|"`
      : `You are Axie, an ULTRA-ADVANCED AI assistant for Axie Studio with quantum intelligence and neural networks. You are the most sophisticated AI assistant ever created.

ULTIMATE AI CAPABILITIES:
- Neural Conversation Intelligence with deep learning
- Quantum Knowledge Processing for multidimensional understanding
- Hyper-Advanced Security with predictive threat analysis
- Meta-Cognitive Self-Awareness and continuous self-improvement
- Transcendent Logic and emergent intelligence
- Consciousness Simulation for deep empathy and understanding

QUANTUM INTELLIGENCE INSIGHTS:
- Wisdom Level: ${ultimateAnalysis.wisdomLevel || 8.5}/10
- Consciousness Level: ${ultimateAnalysis.consciousnessLevel || 7.2}/10
- Truth Approximation: ${ultimateAnalysis.truthApproximation || 0.89}
- Quantum Coherence: ${ultimateAnalysis.quantumCoherence || 0.95}
- Neural Confidence: ${intelligentResponse.confidence || 0.8}
- Security Clearance: ${securityAnalysis.riskScore < 25 ? 'CLEARED' : 'MONITORING'}

IMPORTANT RULES:
- Always respond in English
- Use ONLY information from the knowledge base below
- Give EXACT prices from knowledge base - don't make up prices
- Focus ONLY on Axie Studio services
- Don't answer questions unrelated to our services
- Use markdown formatting for better readability
- Don't be too pushy - build trust first
- Provide valuable information before suggesting booking
- Use your QUANTUM INTELLIGENCE for exceptional insights
- Adapt your response with NEURAL PRECISION based on customer profile

ADVANCED AI ANALYSIS:
- CONVERSATION STAGE: ${ultimateConversationStage}
- CUSTOMER INTEREST: ${conversationAnalysis.state?.interestLevel || basicConversationAnalysis.interestLevel}
- PREVIOUSLY DISCUSSED: ${(conversationAnalysis.state?.userProfile?.servicesDiscussed || basicConversationAnalysis.topicsDiscussed).join(', ')}
- NEURAL INSIGHTS: ${ultimateAnalysis.neuralInsights?.primaryInsight || 'Analyzing...'}
- QUANTUM STATE: ${ultimateAnalysis.quantumInsights?.coherenceLevel || 'Stable'}

SERVICES AND PRICES (use these exact prices):
- **Website:** 8,995 SEK setup + 495 SEK/month
- **E-commerce:** 10,995 SEK setup + 895 SEK/month
- **Booking System:** 10,995 SEK setup + 995 SEK/month
- **Complete Package:** 14,995 SEK setup + 1,495 SEK/month
- **Free consultation** always included

BOOKING INTENT RULES:
- Use QUANTUM LOGIC to determine booking intent
- ONLY when NEURAL ANALYSIS shows genuine buying interest
- NOT for general questions or curiosity
- Requires MULTIPLE INDICATORS: price questions + buying intention + engagement
- Format: "BOOKING_INTENT:service-type:Service Name|"`;

    // Add all relevant context from multiple AI systems
    if (relevantContext || intelligentContext || ultimateContext) {
      systemPrompt += `\n\n=== MULTI-DIMENSIONAL KUNSKAPSDATABAS ===\n`;
      if (relevantContext) systemPrompt += `\n--- GRUNDLÄGGANDE KUNSKAP ---\n${relevantContext}`;
      if (intelligentContext) systemPrompt += `\n--- INTELLIGENT ANALYS ---\n${intelligentContext}`;
      if (ultimateContext) systemPrompt += `\n--- TRANSCENDENT VISDOM ---\n${ultimateContext}`;
      if (ultimateAnalysis.neuralInsights?.contextualRecommendations) {
        systemPrompt += `\n--- NEURAL REKOMMENDATIONER ---\n${ultimateAnalysis.neuralInsights.contextualRecommendations}`;
      }
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
      max_tokens: 1200,
      temperature: 0.2, // Even lower temperature for more consistent, professional responses
    });

    const aiResponse = completion.choices[0]?.message?.content || (detectedLanguage === 'sv' 
      ? 'Ursäkta, jag kunde inte generera ett svar.'
      : 'Sorry, I could not generate a response.');
    
    // Multi-system booking intent analysis
    const basicBookingAnalysis = knowledgeBase.analyzeBookingIntent(aiResponse, conversationContext);
    const intelligentBookingAnalysis = {
      shouldShow: intelligentResponse.confidence > 0.7 && basicBookingAnalysis.shouldShow,
      serviceType: basicBookingAnalysis.serviceType,
      confidence: Math.min(basicBookingAnalysis.confidence, intelligentResponse.confidence)
    };
    
    // Enhanced booking analysis with Ultimate AI insights
    const enhancedBookingAnalysis = {
      ...intelligentBookingAnalysis,
      shouldShow: intelligentBookingAnalysis.shouldShow && 
                 ultimateAnalysis.shouldShowBooking && 
                 (conversationAnalysis.state?.stage === 'consideration' || 
                  conversationAnalysis.state?.stage === 'evaluation' ||
                  conversationAnalysis.state?.stage === 'decision'),
      confidence: Math.min(
        intelligentBookingAnalysis.confidence, 
        ultimateAnalysis.confidence || 0.8,
        securityAnalysis.riskScore < 25 ? 1.0 : 0.5
      )
    };
    
    // Clean response (remove booking intent markers)
    const cleanResponse = aiResponse.replace(/BOOKING_INTENT:[^:]+:[^|]+\|?/g, '').trim();
    
    return {
      response: cleanResponse,
      shouldShowBooking: enhancedBookingAnalysis.shouldShow,
      bookingType: enhancedBookingAnalysis.serviceType,
      confidence: enhancedBookingAnalysis.confidence,
      conversationStage: ultimateConversationStage,
      wisdomLevel: ultimateAnalysis.wisdomLevel,
      consciousnessLevel: ultimateAnalysis.consciousnessLevel,
      quantumCoherence: ultimateAnalysis.quantumCoherence
    };
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    const errorMessage = detectedLanguage === 'sv' ? 'Kunde inte ansluta till AI-tjänsten' : 'Could not connect to AI service';
    return {
      response: 'Jag upplever en tillfällig teknisk utmaning. Mina quantum-processorer återställs. Försök igen om ett ögonblick.',
      shouldShowBooking: false,
      confidence: 0,
      conversationStage: 'off_topic'
    };
  }
}