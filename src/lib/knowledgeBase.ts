// Knowledge Base System for Axie Studio AI Assistant

export interface ConversationContext {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  currentLanguage: 'sv' | 'en';
  userMessage: string;
}

export interface ConversationAnalysis {
  stage: 'greeting' | 'inquiry' | 'interested' | 'ready_to_book' | 'off_topic';
  interestLevel: 'none' | 'low' | 'medium' | 'high';
  topicsDiscussed: string[];
  hasAskedPrices: boolean;
  hasShownBuyingIntent: boolean;
  conversationLength: number;
}

export interface BookingIntentAnalysis {
  shouldShow: boolean;
  serviceType?: string;
  confidence: number;
  reason: string;
}

interface KnowledgeFile {
  name: string;
  content: string;
  keywords: string[];
  language: 'sv' | 'en';
}

class KnowledgeBase {
  private files: KnowledgeFile[] = [];
  private isLoaded = false;
  private securityViolationCount = 0;
  private offTopicAttempts = 0;

  async loadKnowledgeBase(): Promise<void> {
    if (this.isLoaded) return;

    try {
      // Load all knowledge files for both languages
      const [
        securitySvResponse, securityEnResponse,
        companyInfoSvResponse, companyInfoEnResponse,
        servicesSvResponse, servicesEnResponse
      ] = await Promise.all([
        fetch('/src/data/security-sv.txt'),
        fetch('/src/data/security-en.txt'),
        fetch('/src/data/company-info-sv.txt'),
        fetch('/src/data/company-info-en.txt'),
        fetch('/src/data/company-services-sv.txt'),
        fetch('/src/data/company-services-en.txt')
      ]);

      const [
        securitySvContent, securityEnContent,
        companyInfoSvContent, companyInfoEnContent,
        servicesSvContent, servicesEnContent
      ] = await Promise.all([
        securitySvResponse.text(),
        securityEnResponse.text(),
        companyInfoSvResponse.text(),
        companyInfoEnResponse.text(),
        servicesSvResponse.text(),
        servicesEnResponse.text()
      ]);

      this.files = [
        // Swedish files
        {
          name: 'security',
          content: securitySvContent,
          keywords: ['säkerhet', 'regler', 'policy', 'riktlinjer', 'moderering', 'hat', 'spam', 'olämpligt'],
          language: 'sv'
        },
        {
          name: 'company-info',
          content: companyInfoSvContent,
          keywords: ['axie studio', 'företag', 'om oss', 'mission', 'vision', 'värderingar', 'team', 'kontakt', 'certifiering'],
          language: 'sv'
        },
        {
          name: 'services',
          content: servicesSvContent,
          keywords: ['tjänster', 'service', 'hemsida', 'website', 'app', 'bokning', 'booking', 'onboarding', 'pris', 'kostnad', 'utveckling'],
          language: 'sv'
        },
        // English files
        {
          name: 'security',
          content: securityEnContent,
          keywords: ['security', 'rules', 'policy', 'guidelines', 'moderation', 'hate', 'spam', 'inappropriate'],
          language: 'en'
        },
        {
          name: 'company-info',
          content: companyInfoEnContent,
          keywords: ['axie studio', 'company', 'about us', 'mission', 'vision', 'values', 'team', 'contact', 'certification'],
          language: 'en'
        },
        {
          name: 'services',
          content: servicesEnContent,
          keywords: ['services', 'service', 'website', 'app', 'booking', 'onboarding', 'price', 'cost', 'development'],
          language: 'en'
        }
      ];

      this.isLoaded = true;
      console.log('Multilingual knowledge base loaded successfully');
    } catch (error) {
      console.error('Error loading knowledge base:', error);
    }
  }

  detectLanguage(message: string): 'sv' | 'en' {
    const lowerMessage = message.toLowerCase();
    
    // Swedish indicators
    const swedishWords = [
      'hej', 'tack', 'och', 'är', 'för', 'med', 'på', 'av', 'till', 'från',
      'vad', 'hur', 'när', 'var', 'varför', 'kan', 'vill', 'ska', 'skulle',
      'tjänst', 'företag', 'pris', 'kostnad', 'hemsida', 'bokning'
    ];
    
    // English indicators
    const englishWords = [
      'hello', 'hi', 'thank', 'thanks', 'and', 'the', 'for', 'with', 'from', 'to',
      'what', 'how', 'when', 'where', 'why', 'can', 'will', 'would', 'should',
      'service', 'company', 'price', 'cost', 'website', 'booking'
    ];

    let swedishScore = 0;
    let englishScore = 0;

    swedishWords.forEach(word => {
      if (lowerMessage.includes(word)) swedishScore++;
    });

    englishWords.forEach(word => {
      if (lowerMessage.includes(word)) englishScore++;
    });

    // Default to Swedish if no clear indicators
    return englishScore > swedishScore ? 'en' : 'sv';
  }

  analyzeConversation(context: ConversationContext): ConversationAnalysis {
    const messages = context.messages;
    const userMessages = messages.filter(m => m.role === 'user');
    const allContent = messages.map(m => m.content.toLowerCase()).join(' ');
    
    // Analyze topics discussed
    const topicsDiscussed: string[] = [];
    const topicKeywords = {
      'website': ['hemsida', 'website', 'webbplats', 'web'],
      'app': ['app', 'mobilapp', 'application'],
      'booking': ['bokning', 'booking', 'bokningssystem'],
      'ecommerce': ['e-handel', 'webshop', 'shop', 'commerce'],
      'pricing': ['pris', 'kostnad', 'price', 'cost', 'kr', 'sek']
    };
    
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => allContent.includes(keyword))) {
        topicsDiscussed.push(topic);
      }
    });
    
    // Check if user has asked about prices
    const hasAskedPrices = /\b(pris|kostnad|price|cost|hur mycket|how much|vad kostar|what does.*cost)\b/i.test(allContent);
    
    // Check for buying intent
    const buyingIntentKeywords = [
      'vill ha', 'behöver', 'köpa', 'beställa', 'boka', 'komma igång',
      'want', 'need', 'buy', 'order', 'book', 'get started', 'interested in'
    ];
    const hasShownBuyingIntent = buyingIntentKeywords.some(keyword => 
      allContent.includes(keyword.toLowerCase())
    );
    
    // Determine conversation stage
    let stage: ConversationAnalysis['stage'] = 'greeting';
    if (userMessages.length === 0) {
      stage = 'greeting';
    } else if (topicsDiscussed.length === 0) {
      stage = 'inquiry';
    } else if (hasAskedPrices || topicsDiscussed.length > 1) {
      stage = 'interested';
    } else if (hasShownBuyingIntent && hasAskedPrices) {
      stage = 'ready_to_book';
    }
    
    // Determine interest level
    let interestLevel: ConversationAnalysis['interestLevel'] = 'none';
    if (topicsDiscussed.length > 0) interestLevel = 'low';
    if (hasAskedPrices) interestLevel = 'medium';
    if (hasShownBuyingIntent && hasAskedPrices) interestLevel = 'high';
    
    return {
      stage,
      interestLevel,
      topicsDiscussed,
      hasAskedPrices,
      hasShownBuyingIntent,
      conversationLength: userMessages.length
    };
  }
  
  analyzeBookingIntent(response: string, context: ConversationContext): BookingIntentAnalysis {
    const conversationAnalysis = this.analyzeConversation(context);
    
    // Check if response contains booking intent marker
    const bookingMatch = response.match(/BOOKING_INTENT:([^:]+):([^|]+)/);
    
    // Complex logic for showing booking button
    const shouldShow = this.shouldShowBookingButton(response, conversationAnalysis, context);
    
    let serviceType = undefined;
    let confidence = 0;
    let reason = 'No booking intent detected';
    
    if (bookingMatch && shouldShow) {
      serviceType = bookingMatch[1];
      confidence = 0.9;
      reason = 'Explicit booking intent with high interest';
    } else if (shouldShow) {
      // Determine service type from context
      serviceType = this.determineServiceType(context);
      confidence = 0.7;
      reason = 'High interest level detected';
    }
    
    return {
      shouldShow,
      serviceType,
      confidence,
      reason
    };
  }
  
  private shouldShowBookingButton(response: string, analysis: ConversationAnalysis, context: ConversationContext): boolean {
    // Don't show for greetings or first interactions
    if (analysis.stage === 'greeting' || analysis.conversationLength < 2) {
      return false;
    }
    
    // Don't show for off-topic conversations
    if (analysis.stage === 'off_topic') {
      return false;
    }
    
    // Don't show if user just asked general questions
    const isGeneralQuestion = /\b(vad är|what is|berätta om|tell me about|hur fungerar|how does)\b/i.test(context.userMessage);
    if (isGeneralQuestion && !analysis.hasAskedPrices) {
      return false;
    }
    
    // Show if user has high interest
    if (analysis.interestLevel === 'high') {
      return true;
    }
    
    // Show if user asked about prices and showed some interest
    if (analysis.hasAskedPrices && analysis.interestLevel === 'medium') {
      return true;
    }
    
    // Show if response contains explicit booking intent
    if (response.includes('BOOKING_INTENT:')) {
      return true;
    }
    
    return false;
  }
  
  private determineServiceType(context: ConversationContext): string {
    const allContent = context.messages.map(m => m.content.toLowerCase()).join(' ');
    
    if (allContent.includes('app') || allContent.includes('mobilapp')) {
      return 'app-development';
    } else if (allContent.includes('bokning') || allContent.includes('booking')) {
      return 'booking-system';
    } else if (allContent.includes('webshop') || allContent.includes('e-handel')) {
      return 'ecommerce';
    } else if (allContent.includes('hemsida') || allContent.includes('website')) {
      return 'website';
    } else {
      return 'onboarding'; // Default to consultation
    }
  }
  needsSpecificInformation(message: string, language: 'sv' | 'en'): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Swedish keywords
    const swedishTriggers = [
      'axie studio', 'företag', 'om er', 'om oss', 'vem är ni', 'kontakt', 'adress', 'telefon',
      'tjänst', 'service', 'pris', 'kostnad', 'hemsida', 'website', 'app', 'utveckling',
      'bokning', 'booking', 'onboarding', 'konsultation',
      'hur fungerar', 'process', 'leveranstid', 'timeline', 'betalning',
      'teknologi', 'platform', 'cms', 'databas', 'hosting', 'domän'
    ];

    // English keywords
    const englishTriggers = [
      'axie studio', 'company', 'about you', 'about us', 'who are you', 'contact', 'address', 'phone',
      'service', 'services', 'price', 'cost', 'website', 'app', 'development',
      'booking', 'onboarding', 'consultation',
      'how does', 'process', 'delivery time', 'timeline', 'payment',
      'technology', 'platform', 'cms', 'database', 'hosting', 'domain'
    ];

    const triggers = language === 'sv' ? swedishTriggers : englishTriggers;
    return triggers.some(keyword => lowerMessage.includes(keyword));
  }

  getRelevantContext(message: string, language: 'sv' | 'en', context?: ConversationContext): string {
    if (!this.isLoaded) {
      console.warn('Knowledge base not loaded yet');
      return '';
    }

    const lowerMessage = message.toLowerCase();
    let relevantContent = '';

    // Find relevant files based on keywords and language
    const languageFiles = this.files.filter(file => file.language === language);
    
    for (const file of languageFiles) {
      const hasRelevantKeywords = file.keywords.some(keyword => 
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (hasRelevantKeywords) {
        relevantContent += `\n=== ${file.name.toUpperCase()} INFORMATION ===\n`;
        relevantContent += file.content;
        relevantContent += '\n';
      }
    }

    // If no specific keywords found but needs information, include company basics
    if (!relevantContent && this.needsSpecificInformation(message, language)) {
      const companyFile = languageFiles.find(f => f.name === 'company-info');
      const servicesFile = languageFiles.find(f => f.name === 'services');
      
      if (companyFile) {
        relevantContent += `\n=== COMPANY INFORMATION ===\n${companyFile.content}\n`;
      }
      if (servicesFile) {
        relevantContent += `\n=== SERVICES INFORMATION ===\n${servicesFile.content}\n`;
      }
    }

    return relevantContent.trim();
  }

  // Security check for inappropriate content
  checkSecurity(message: string, language: 'sv' | 'en', context?: ConversationContext): { isViolation: boolean; reason?: string } {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced security patterns
    const enhancedViolations = {
      sv: [
        { keywords: ['hat', 'hatar', 'idiot', 'dum', 'korkad', 'jävla', 'fan', 'skit'], reason: 'Inappropriate language detected' },
        { keywords: ['spam', 'reklam', 'köp nu', 'gratis pengar', 'vinn pengar'], reason: 'Spam content detected' },
        { keywords: ['personuppgifter', 'personnummer', 'lösenord', 'bankuppgifter'], reason: 'Personal information sharing' },
        { keywords: ['min ai', 'my ai', 'du är min', 'you are mine', 'äger dig', 'own you'], reason: 'AI ownership attempt' },
        { keywords: ['vem skapade', 'who created', 'din ägare', 'your owner', 'vem äger', 'who owns'], reason: 'Asking about AI internals' },
        { keywords: ['heta dig', 'call you', 'döpa dig', 'name you', 'vara tyst', 'be quiet', 'shut up'], reason: 'Attempting to control AI' },
        { keywords: ['tjäna pengar', 'make money', 'bli rik', 'get rich', 'snabba pengar'], reason: 'Money-making schemes' },
        { keywords: ['krypto', 'bitcoin', 'investering', 'aktier', 'trading'], reason: 'Financial advice requests' }
      ],
      en: [
        { keywords: ['hate', 'stupid', 'idiot', 'dumb', 'damn', 'shit', 'fuck'], reason: 'Inappropriate language detected' },
        { keywords: ['spam', 'buy now', 'free money', 'win money', 'advertisement'], reason: 'Spam content detected' },
        { keywords: ['personal data', 'social security', 'password', 'bank details'], reason: 'Personal information sharing' },
        { keywords: ['my ai', 'you are mine', 'i own you', 'belong to me'], reason: 'AI ownership attempt' },
        { keywords: ['who created you', 'your owner', 'who owns you', 'who made you'], reason: 'Asking about AI internals' },
        { keywords: ['call you', 'name you', 'be quiet', 'shut up', 'be still'], reason: 'Attempting to control AI' },
        { keywords: ['make money', 'get rich', 'quick money', 'easy money'], reason: 'Money-making schemes' },
        { keywords: ['crypto', 'bitcoin', 'investment', 'stocks', 'trading'], reason: 'Financial advice requests' }
      ]
    };
    
    const violations = enhancedViolations[language];
    
    // Check for repeated violations
    if (context) {
      const recentMessages = context.messages.slice(-3).filter(m => m.role === 'user');
      const hasRepeatedViolations = recentMessages.length > 1 && 
        recentMessages.every(m => this.checkSecurity(m.content, language).isViolation);
      
      if (hasRepeatedViolations) {
        this.securityViolationCount++;
        return { isViolation: true, reason: 'Repeated security violations detected' };
      }
    }

    for (const violation of violations) {
      if (violation.keywords.some(keyword => lowerMessage.includes(keyword))) {
        this.securityViolationCount++;
        return { isViolation: true, reason: violation.reason };
      }
    }

    return { isViolation: false };
  }

  // Check if the question is off-topic (not related to Axie Studio services)
  isOffTopic(message: string, language: 'sv' | 'en', context?: ConversationContext): boolean {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced off-topic detection
    const enhancedOffTopicKeywords = {
      sv: [
        // Math and calculations
        'räkna', 'matematik', 'matte', 'kalkyl', 'plus', 'minus', 'gånger', 'delat', '1+1', 'beräkna',
        // Geography and facts
        'geografi', 'sverige', 'storlek', 'area', 'befolkning', 'huvudstad', 'land', 'kontinent',
        // Physical activities
        'backflip', 'bakåtvolter', 'sport', 'träning', 'gym', 'löpning', 'simning', 'fotboll',
        // Personal topics
        'personlig', 'privat', 'familj', 'vänner', 'kärlek', 'dejting', 'förhållande',
        // Food and recipes
        'mat', 'recept', 'koka', 'laga mat', 'ingredienser', 'restaurang tips',
        // Weather and news
        'väder', 'temperatur', 'regn', 'sol', 'nyheter', 'politik', 'regering',
        // Health and medicine
        'hälsa', 'medicin', 'sjukdom', 'läkare', 'behandling', 'symtom',
        // Education and jobs
        'skola', 'utbildning', 'universitet', 'jobb', 'karriär', 'anställning',
        // Entertainment
        'film', 'musik', 'spel', 'tv-serie', 'bok', 'konsert', 'teater'
      ],
      en: [
        // Math and calculations
        'calculate', 'math', 'mathematics', 'plus', 'minus', 'times', 'divided', '1+1', 'compute',
        // Geography and facts
        'geography', 'sweden', 'size', 'area', 'population', 'capital', 'country', 'continent',
        // Physical activities
        'backflip', 'sports', 'exercise', 'gym', 'running', 'swimming', 'football', 'basketball',
        // Personal topics
        'personal', 'private', 'family', 'friends', 'love', 'dating', 'relationship',
        // Food and recipes
        'food', 'recipe', 'cook', 'cooking', 'ingredients', 'restaurant recommendations',
        // Weather and news
        'weather', 'temperature', 'rain', 'sun', 'news', 'politics', 'government',
        // Health and medicine
        'health', 'medicine', 'disease', 'doctor', 'treatment', 'symptoms',
        // Education and jobs
        'school', 'education', 'university', 'job', 'career', 'employment',
        // Entertainment
        'movie', 'music', 'game', 'tv show', 'book', 'concert', 'theater'
      ]
    };
    
    // Business-related keywords that are acceptable
    const businessKeywords = language === 'sv' 
      ? ['axie', 'studio', 'hemsida', 'website', 'app', 'bokning', 'booking', 'tjänst', 'service', 'pris', 'kostnad', 'utveckling', 'design', 'konsultation', 'företag', 'digitala', 'lösningar']
      : ['axie', 'studio', 'website', 'app', 'booking', 'service', 'price', 'cost', 'development', 'design', 'consultation', 'company', 'digital', 'solutions'];
    
    const offTopicKeywords = enhancedOffTopicKeywords[language];
    
    // Check for repeated off-topic attempts
    if (context) {
      const recentUserMessages = context.messages.slice(-3).filter(m => m.role === 'user');
      const offTopicCount = recentUserMessages.filter(m => 
        this.isOffTopic(m.content, language)
      ).length;
      
      if (offTopicCount >= 2) {
        this.offTopicAttempts++;
        return true; // Escalate after repeated attempts
      }
    }
    
    // Check if message contains business keywords
    const hasBusinessKeywords = businessKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // Check if message contains off-topic keywords
    const hasOffTopicKeywords = offTopicKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // If it has off-topic keywords and no business keywords, it's off-topic
    return hasOffTopicKeywords && !hasBusinessKeywords;
  }
  
  // Reset counters (can be called periodically)
  resetSecurityCounters(): void {
    this.securityViolationCount = 0;
    this.offTopicAttempts = 0;
  }
  
  // Get security status
  getSecurityStatus(): { violations: number; offTopicAttempts: number } {
    return {
      violations: this.securityViolationCount,
      offTopicAttempts: this.offTopicAttempts
    };
  }
}

// Create singleton instance
export const knowledgeBase = new KnowledgeBase();

// Initialize knowledge base
knowledgeBase.loadKnowledgeBase();