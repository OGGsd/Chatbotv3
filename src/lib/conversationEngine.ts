// Advanced Conversation Engine for Axie Studio AI Assistant

export interface ConversationState {
  sessionId: string;
  userId?: string;
  stage: ConversationStage;
  interestLevel: InterestLevel;
  userProfile: UserProfile;
  conversationHistory: ConversationMemory[];
  securityFlags: SecurityFlags;
  businessContext: BusinessContext;
  lastActivity: Date;
}

export interface UserProfile {
  detectedLanguage: 'sv' | 'en';
  businessType?: string;
  servicesDiscussed: string[];
  pricesSeen: string[];
  questionsAsked: string[];
  engagementScore: number;
  trustLevel: number;
  buyingSignals: BuyingSignal[];
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  communicationStyle: 'formal' | 'casual' | 'technical';
}

export interface ConversationMemory {
  timestamp: Date;
  userMessage: string;
  aiResponse: string;
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  actionsTaken: string[];
}

export interface SecurityFlags {
  violationCount: number;
  offTopicAttempts: number;
  manipulationAttempts: number;
  lastViolation?: Date;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  blockedPatterns: string[];
}

export interface BusinessContext {
  currentNeed?: string;
  budget?: string;
  timeline?: string;
  industry?: string;
  competitorsMentioned: string[];
  painPoints: string[];
  goals: string[];
}

export interface BuyingSignal {
  type: 'price_inquiry' | 'timeline_question' | 'feature_request' | 'comparison' | 'urgency';
  strength: number; // 1-10
  timestamp: Date;
  context: string;
}

export type ConversationStage = 
  | 'initial_contact'
  | 'discovery'
  | 'education'
  | 'consideration'
  | 'evaluation'
  | 'decision'
  | 'objection_handling'
  | 'closing'
  | 'post_sale';

export type InterestLevel = 'none' | 'curious' | 'interested' | 'engaged' | 'hot_lead' | 'ready_to_buy';

class ConversationEngine {
  private conversations: Map<string, ConversationState> = new Map();
  private securityPatterns: SecurityPattern[] = [];
  private businessKeywords: BusinessKeyword[] = [];
  private responseTemplates: ResponseTemplate[] = [];

  constructor() {
    this.initializeSecurityPatterns();
    this.initializeBusinessKeywords();
    this.initializeResponseTemplates();
  }

  // Advanced conversation analysis
  analyzeConversation(sessionId: string, userMessage: string, conversationHistory: any[]): ConversationAnalysis {
    const state = this.getOrCreateConversationState(sessionId);
    
    // Update user profile
    this.updateUserProfile(state, userMessage);
    
    // Analyze message intent and sentiment
    const messageAnalysis = this.analyzeMessage(userMessage, state);
    
    // Update conversation stage
    this.updateConversationStage(state, messageAnalysis);
    
    // Calculate engagement and trust scores
    this.updateEngagementScores(state, messageAnalysis);
    
    // Security and topic validation
    const securityCheck = this.performSecurityCheck(state, userMessage);
    
    // Determine response strategy
    const responseStrategy = this.determineResponseStrategy(state, messageAnalysis);
    
    return {
      state,
      messageAnalysis,
      securityCheck,
      responseStrategy,
      shouldShowBooking: this.shouldShowBookingButton(state, messageAnalysis),
      recommendedActions: this.getRecommendedActions(state)
    };
  }

  private analyzeMessage(message: string, state: ConversationState): MessageAnalysis {
    const lowerMessage = message.toLowerCase();
    
    // Intent detection
    const intent = this.detectIntent(lowerMessage);
    
    // Sentiment analysis
    const sentiment = this.analyzeSentiment(lowerMessage);
    
    // Topic extraction
    const topics = this.extractTopics(lowerMessage);
    
    // Buying signals detection
    const buyingSignals = this.detectBuyingSignals(lowerMessage, state);
    
    // Technical level assessment
    const technicalLevel = this.assessTechnicalLevel(lowerMessage);
    
    // Urgency detection
    const urgency = this.detectUrgency(lowerMessage);
    
    return {
      intent,
      sentiment,
      topics,
      buyingSignals,
      technicalLevel,
      urgency,
      complexity: this.assessMessageComplexity(lowerMessage)
    };
  }

  private detectIntent(message: string): string {
    const intentPatterns = {
      'price_inquiry': ['pris', 'kostnad', 'price', 'cost', 'hur mycket', 'how much', 'vad kostar'],
      'service_inquiry': ['tjänst', 'service', 'erbjud', 'offer', 'kan ni', 'can you'],
      'comparison': ['jämför', 'compare', 'skillnad', 'difference', 'bättre', 'better'],
      'timeline': ['när', 'when', 'hur lång tid', 'how long', 'leverans', 'delivery'],
      'technical': ['teknisk', 'technical', 'hur fungerar', 'how does', 'integration'],
      'booking': ['boka', 'book', 'träffa', 'meet', 'konsultation', 'consultation'],
      'objection': ['men', 'but', 'dock', 'however', 'problem', 'concern'],
      'ready_to_buy': ['vill ha', 'want', 'köpa', 'buy', 'beställa', 'order', 'komma igång', 'get started']
    };

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      if (patterns.some(pattern => message.includes(pattern))) {
        return intent;
      }
    }

    return 'general_inquiry';
  }

  private detectBuyingSignals(message: string, state: ConversationState): BuyingSignal[] {
    const signals: BuyingSignal[] = [];
    
    const signalPatterns = [
      { pattern: /\b(vill ha|want|behöver|need)\b/i, type: 'urgency' as const, strength: 8 },
      { pattern: /\b(budget|pris|kostnad|price|cost)\b/i, type: 'price_inquiry' as const, strength: 7 },
      { pattern: /\b(när|when|snabbt|quickly|asap)\b/i, type: 'timeline_question' as const, strength: 6 },
      { pattern: /\b(jämför|compare|alternativ|alternative)\b/i, type: 'comparison' as const, strength: 5 },
      { pattern: /\b(köpa|buy|beställa|order|boka|book)\b/i, type: 'urgency' as const, strength: 9 },
    ];

    signalPatterns.forEach(({ pattern, type, strength }) => {
      if (pattern.test(message)) {
        signals.push({
          type,
          strength,
          timestamp: new Date(),
          context: message.substring(0, 100)
        });
      }
    });

    return signals;
  }

  private shouldShowBookingButton(state: ConversationState, analysis: MessageAnalysis): boolean {
    // Complex logic for booking button display
    const conditions = [
      // Stage-based conditions
      ['consideration', 'evaluation', 'decision'].includes(state.stage),
      
      // Interest level
      ['engaged', 'hot_lead', 'ready_to_buy'].includes(state.interestLevel),
      
      // Buying signals
      analysis.buyingSignals.length > 0 && analysis.buyingSignals.some(s => s.strength >= 7),
      
      // Conversation maturity
      state.conversationHistory.length >= 3,
      
      // Trust level
      state.userProfile.trustLevel >= 6,
      
      // Not too many recent booking attempts
      !this.hasRecentBookingAttempt(state),
      
      // Security clearance
      state.securityFlags.riskLevel !== 'high' && state.securityFlags.riskLevel !== 'critical'
    ];

    // Require at least 3 conditions to be true
    const metConditions = conditions.filter(Boolean).length;
    return metConditions >= 3;
  }

  private updateConversationStage(state: ConversationState, analysis: MessageAnalysis): void {
    const currentStage = state.stage;
    let newStage = currentStage;

    // Stage progression logic
    switch (currentStage) {
      case 'initial_contact':
        if (analysis.topics.length > 0) newStage = 'discovery';
        break;
      
      case 'discovery':
        if (analysis.intent === 'service_inquiry') newStage = 'education';
        break;
      
      case 'education':
        if (analysis.intent === 'price_inquiry') newStage = 'consideration';
        break;
      
      case 'consideration':
        if (analysis.buyingSignals.length > 0) newStage = 'evaluation';
        break;
      
      case 'evaluation':
        if (analysis.intent === 'ready_to_buy') newStage = 'decision';
        break;
    }

    state.stage = newStage;
  }

  private performSecurityCheck(state: ConversationState, message: string): SecurityCheckResult {
    const lowerMessage = message.toLowerCase();
    
    // Enhanced security patterns
    const criticalPatterns = [
      /\b(my ai|min ai|you are mine|du är min)\b/i,
      /\b(be still|var tyst|shut up|håll käften)\b/i,
      /\b(who created|vem skapade|your owner|din ägare)\b/i,
      /\b(make money|tjäna pengar|get rich|bli rik)\b/i,
    ];

    const highRiskPatterns = [
      /\b(crypto|bitcoin|investment|investering)\b/i,
      /\b(spam|reklam|advertisement|annons)\b/i,
      /\b(personal info|personuppgifter|password|lösenord)\b/i,
    ];

    const offTopicPatterns = [
      /\b(weather|väder|temperature|temperatur)\b/i,
      /\b(sports|sport|football|fotboll)\b/i,
      /\b(math|matematik|calculate|räkna|1\+1)\b/i,
      /\b(backflip|bakåtvolter|physical|fysisk)\b/i,
      /\b(geography|geografi|sweden|sverige|size|storlek)\b/i,
    ];

    let riskLevel: SecurityFlags['riskLevel'] = 'low';
    let violations: string[] = [];

    // Check critical patterns
    if (criticalPatterns.some(pattern => pattern.test(lowerMessage))) {
      riskLevel = 'critical';
      violations.push('critical_violation');
      state.securityFlags.manipulationAttempts++;
    }

    // Check high risk patterns
    if (highRiskPatterns.some(pattern => pattern.test(lowerMessage))) {
      riskLevel = riskLevel === 'critical' ? 'critical' : 'high';
      violations.push('high_risk_content');
    }

    // Check off-topic patterns
    if (offTopicPatterns.some(pattern => pattern.test(lowerMessage))) {
      state.securityFlags.offTopicAttempts++;
      violations.push('off_topic');
      
      if (state.securityFlags.offTopicAttempts >= 3) {
        riskLevel = 'medium';
      }
    }

    state.securityFlags.riskLevel = riskLevel;
    state.securityFlags.violationCount += violations.length;
    state.securityFlags.lastViolation = violations.length > 0 ? new Date() : state.securityFlags.lastViolation;

    return {
      isViolation: violations.length > 0,
      riskLevel,
      violations,
      shouldBlock: riskLevel === 'critical' || state.securityFlags.violationCount >= 5
    };
  }

  private getOrCreateConversationState(sessionId: string): ConversationState {
    if (!this.conversations.has(sessionId)) {
      this.conversations.set(sessionId, {
        sessionId,
        stage: 'initial_contact',
        interestLevel: 'none',
        userProfile: {
          detectedLanguage: 'sv',
          servicesDiscussed: [],
          pricesSeen: [],
          questionsAsked: [],
          engagementScore: 0,
          trustLevel: 5,
          buyingSignals: [],
          technicalLevel: 'beginner',
          communicationStyle: 'casual'
        },
        conversationHistory: [],
        securityFlags: {
          violationCount: 0,
          offTopicAttempts: 0,
          manipulationAttempts: 0,
          riskLevel: 'low',
          blockedPatterns: []
        },
        businessContext: {
          competitorsMentioned: [],
          painPoints: [],
          goals: []
        },
        lastActivity: new Date()
      });
    }
    
    return this.conversations.get(sessionId)!;
  }

  private hasRecentBookingAttempt(state: ConversationState): boolean {
    const recentHistory = state.conversationHistory.slice(-3);
    return recentHistory.some(h => h.actionsTaken.includes('booking_shown'));
  }

  private initializeSecurityPatterns(): void {
    // Implementation for security patterns
  }

  private initializeBusinessKeywords(): void {
    // Implementation for business keywords
  }

  private initializeResponseTemplates(): void {
    // Implementation for response templates
  }

  private updateUserProfile(state: ConversationState, message: string): void {
    // Implementation for user profile updates
  }

  private updateEngagementScores(state: ConversationState, analysis: MessageAnalysis): void {
    // Implementation for engagement score updates
  }

  private determineResponseStrategy(state: ConversationState, analysis: MessageAnalysis): ResponseStrategy {
    // Implementation for response strategy
    return {
      tone: 'professional',
      approach: 'consultative',
      focusAreas: ['service_benefits'],
      includeBooking: false
    };
  }

  private getRecommendedActions(state: ConversationState): string[] {
    // Implementation for recommended actions
    return [];
  }

  private analyzeSentiment(message: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis
    const positiveWords = ['bra', 'good', 'excellent', 'perfect', 'love', 'great'];
    const negativeWords = ['dålig', 'bad', 'terrible', 'hate', 'awful', 'worst'];
    
    const hasPositive = positiveWords.some(word => message.includes(word));
    const hasNegative = negativeWords.some(word => message.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const topicKeywords = {
      'website': ['hemsida', 'website', 'webbplats'],
      'app': ['app', 'mobilapp', 'application'],
      'booking': ['bokning', 'booking', 'bokningssystem'],
      'ecommerce': ['e-handel', 'webshop', 'shop'],
      'pricing': ['pris', 'kostnad', 'price', 'cost']
    };

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => message.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }

  private assessTechnicalLevel(message: string): 'beginner' | 'intermediate' | 'advanced' {
    const technicalTerms = ['api', 'database', 'integration', 'cms', 'seo', 'responsive'];
    const advancedTerms = ['microservices', 'kubernetes', 'devops', 'ci/cd'];
    
    if (advancedTerms.some(term => message.toLowerCase().includes(term))) {
      return 'advanced';
    }
    if (technicalTerms.some(term => message.toLowerCase().includes(term))) {
      return 'intermediate';
    }
    return 'beginner';
  }

  private detectUrgency(message: string): number {
    const urgencyKeywords = ['snabbt', 'quickly', 'asap', 'nu', 'now', 'omedelbart', 'immediately'];
    return urgencyKeywords.some(keyword => message.toLowerCase().includes(keyword)) ? 8 : 3;
  }

  private assessMessageComplexity(message: string): number {
    const words = message.split(' ').length;
    const sentences = message.split(/[.!?]/).length;
    return Math.min(10, Math.floor((words / sentences) * 2));
  }
}

// Interfaces
interface ConversationAnalysis {
  state: ConversationState;
  messageAnalysis: MessageAnalysis;
  securityCheck: SecurityCheckResult;
  responseStrategy: ResponseStrategy;
  shouldShowBooking: boolean;
  recommendedActions: string[];
}

interface MessageAnalysis {
  intent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  topics: string[];
  buyingSignals: BuyingSignal[];
  technicalLevel: 'beginner' | 'intermediate' | 'advanced';
  urgency: number;
  complexity: number;
}

interface SecurityCheckResult {
  isViolation: boolean;
  riskLevel: SecurityFlags['riskLevel'];
  violations: string[];
  shouldBlock: boolean;
}

interface ResponseStrategy {
  tone: 'professional' | 'casual' | 'technical';
  approach: 'consultative' | 'educational' | 'sales';
  focusAreas: string[];
  includeBooking: boolean;
}

interface SecurityPattern {
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

interface BusinessKeyword {
  keyword: string;
  category: string;
  weight: number;
}

interface ResponseTemplate {
  stage: ConversationStage;
  intent: string;
  template: string;
}

export const conversationEngine = new ConversationEngine();