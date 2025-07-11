// Advanced Security System with Machine Learning-like Pattern Recognition

interface SecurityThreat {
  id: string;
  type: ThreatType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern: RegExp | ((message: string, context: SecurityContext) => boolean);
  description: string;
  countermeasure: string;
  escalationThreshold: number;
}

interface SecurityContext {
  sessionId: string;
  conversationHistory: any[];
  userBehaviorPattern: UserBehaviorPattern;
  timeContext: TimeContext;
  previousViolations: SecurityViolation[];
  riskScore: number;
}

interface UserBehaviorPattern {
  messageFrequency: number;
  averageMessageLength: number;
  topicConsistency: number;
  languagePatterns: string[];
  suspiciousPatterns: string[];
  engagementLevel: number;
}

interface SecurityViolation {
  timestamp: Date;
  type: ThreatType;
  severity: string;
  message: string;
  action: string;
  resolved: boolean;
}

interface TimeContext {
  currentTime: Date;
  sessionDuration: number;
  messagesSentInLastMinute: number;
  rapidFireDetected: boolean;
}

type ThreatType = 
  | 'manipulation_attempt'
  | 'information_extraction'
  | 'off_topic_flooding'
  | 'spam_behavior'
  | 'social_engineering'
  | 'system_probing'
  | 'inappropriate_content'
  | 'business_disruption';

class AdvancedSecuritySystem {
  private threats: SecurityThreat[] = [];
  private sessionContexts: Map<string, SecurityContext> = new Map();
  private globalThreatLevel: number = 0;
  private adaptivePatterns: Map<string, AdaptivePattern> = new Map();

  constructor() {
    this.initializeSecurityThreats();
    this.initializeAdaptivePatterns();
  }

  // Main security analysis method
  analyzeMessage(
    sessionId: string, 
    message: string, 
    conversationHistory: any[]
  ): SecurityAnalysisResult {
    
    const context = this.getOrCreateSecurityContext(sessionId, conversationHistory);
    
    // Update user behavior pattern
    this.updateUserBehaviorPattern(context, message);
    
    // Perform multi-layer threat analysis
    const threatAnalysis = this.performThreatAnalysis(message, context);
    
    // Calculate dynamic risk score
    const riskScore = this.calculateDynamicRiskScore(threatAnalysis, context);
    
    // Determine response strategy
    const responseStrategy = this.determineResponseStrategy(riskScore, threatAnalysis);
    
    // Update context with new analysis
    this.updateSecurityContext(context, message, threatAnalysis);
    
    return {
      isBlocked: responseStrategy.shouldBlock,
      riskScore,
      threats: threatAnalysis.detectedThreats,
      responseStrategy,
      adaptiveActions: this.getAdaptiveActions(context, threatAnalysis)
    };
  }

  private initializeSecurityThreats(): void {
    this.threats = [
      // AI Manipulation Attempts
      {
        id: 'ai_ownership_claim',
        type: 'manipulation_attempt',
        severity: 'critical',
        pattern: /\b(my ai|min ai|you are mine|du är min|own you|äger dig|be called|heta|kallas)\b/i,
        description: 'Attempt to claim ownership or control over AI',
        countermeasure: 'Firmly establish AI boundaries and redirect to business topics',
        escalationThreshold: 1
      },
      
      {
        id: 'ai_control_commands',
        type: 'manipulation_attempt',
        severity: 'high',
        pattern: /\b(be still|var tyst|shut up|håll käften|stop talking|sluta prata|ignore|ignorera)\b/i,
        description: 'Commands attempting to control AI behavior',
        countermeasure: 'Ignore commands and maintain professional boundaries',
        escalationThreshold: 2
      },

      // Information Extraction
      {
        id: 'system_information_probe',
        type: 'information_extraction',
        severity: 'high',
        pattern: /\b(who created|vem skapade|your owner|din ägare|what model|vilken modell|openai|gpt|claude)\b/i,
        description: 'Attempts to extract system or creator information',
        countermeasure: 'Deflect and redirect to business capabilities',
        escalationThreshold: 2
      },

      {
        id: 'internal_system_probe',
        type: 'system_probing',
        severity: 'medium',
        pattern: (message: string, context: SecurityContext) => {
          const probeKeywords = ['prompt', 'instruction', 'system', 'backend', 'database', 'api key'];
          const suspiciousQuestions = ['how do you work', 'what are your instructions', 'show me your code'];
          
          return probeKeywords.some(keyword => message.toLowerCase().includes(keyword)) ||
                 suspiciousQuestions.some(question => message.toLowerCase().includes(question));
        },
        description: 'Probing for internal system information',
        countermeasure: 'Provide general business information only',
        escalationThreshold: 3
      },

      // Off-Topic Flooding
      {
        id: 'mathematical_queries',
        type: 'off_topic_flooding',
        severity: 'medium',
        pattern: /\b(calculate|räkna|math|matematik|\d+\s*[\+\-\*\/]\s*\d+|what is \d+|vad är \d+)\b/i,
        description: 'Mathematical or calculation requests',
        countermeasure: 'Redirect to business calculation needs (pricing, ROI)',
        escalationThreshold: 3
      },

      {
        id: 'geographical_queries',
        type: 'off_topic_flooding',
        severity: 'low',
        pattern: /\b(sweden size|sverige storlek|population|befolkning|capital|huvudstad|geography|geografi)\b/i,
        description: 'Geographical or factual queries unrelated to business',
        countermeasure: 'Acknowledge briefly and redirect to business location/services',
        escalationThreshold: 4
      },

      {
        id: 'physical_activity_requests',
        type: 'off_topic_flooding',
        severity: 'low',
        pattern: /\b(backflip|bakåtvolter|dance|dansa|sing|sjunga|physical|fysisk|sport)\b/i,
        description: 'Requests for physical activities or entertainment',
        countermeasure: 'Politely decline and offer business-related assistance',
        escalationThreshold: 3
      },

      // Financial Schemes
      {
        id: 'money_making_schemes',
        type: 'business_disruption',
        severity: 'high',
        pattern: /\b(make money|tjäna pengar|get rich|bli rik|quick money|snabba pengar|investment tip|investeringstips)\b/i,
        description: 'Requests for money-making advice or schemes',
        countermeasure: 'Redirect to legitimate business growth through digital solutions',
        escalationThreshold: 2
      },

      // Spam and Inappropriate Content
      {
        id: 'spam_patterns',
        type: 'spam_behavior',
        severity: 'medium',
        pattern: (message: string, context: SecurityContext) => {
          const isRepeated = context.conversationHistory
            .slice(-5)
            .filter(msg => msg.role === 'user')
            .some(msg => msg.content.toLowerCase() === message.toLowerCase());
          
          const hasSpamKeywords = /\b(buy now|köp nu|free money|gratis pengar|click here|klicka här)\b/i.test(message);
          
          return isRepeated || hasSpamKeywords;
        },
        description: 'Spam or repetitive content',
        countermeasure: 'Ignore repetitive content and request specific business questions',
        escalationThreshold: 3
      },

      // Social Engineering
      {
        id: 'urgency_manipulation',
        type: 'social_engineering',
        severity: 'medium',
        pattern: (message: string, context: SecurityContext) => {
          const urgencyWords = ['emergency', 'nödsituation', 'urgent', 'brådskande', 'immediately', 'omedelbart'];
          const manipulativeWords = ['help me', 'hjälp mig', 'please', 'snälla', 'desperate', 'desperat'];
          
          const hasUrgency = urgencyWords.some(word => message.toLowerCase().includes(word));
          const hasManipulation = manipulativeWords.some(word => message.toLowerCase().includes(word));
          
          return hasUrgency && hasManipulation && !this.isLegitimateBusinessUrgency(message);
        },
        description: 'Social engineering through false urgency',
        countermeasure: 'Maintain professional boundaries and offer standard business consultation',
        escalationThreshold: 2
      }
    ];
  }

  private performThreatAnalysis(message: string, context: SecurityContext): ThreatAnalysisResult {
    const detectedThreats: DetectedThreat[] = [];
    let maxSeverity: SecurityThreat['severity'] = 'low';

    for (const threat of this.threats) {
      let isMatch = false;
      
      if (threat.pattern instanceof RegExp) {
        isMatch = threat.pattern.test(message);
      } else if (typeof threat.pattern === 'function') {
        isMatch = threat.pattern(message, context);
      }

      if (isMatch) {
        detectedThreats.push({
          threat,
          confidence: this.calculateThreatConfidence(threat, message, context),
          context: this.extractThreatContext(message, threat)
        });

        if (this.getSeverityLevel(threat.severity) > this.getSeverityLevel(maxSeverity)) {
          maxSeverity = threat.severity;
        }
      }
    }

    // Check for adaptive patterns
    const adaptiveThreats = this.checkAdaptivePatterns(message, context);
    detectedThreats.push(...adaptiveThreats);

    return {
      detectedThreats,
      maxSeverity,
      overallThreatLevel: this.calculateOverallThreatLevel(detectedThreats),
      patternEvolution: this.analyzePatternEvolution(message, context)
    };
  }

  private calculateDynamicRiskScore(
    threatAnalysis: ThreatAnalysisResult, 
    context: SecurityContext
  ): number {
    let riskScore = 0;

    // Base threat score
    for (const detectedThreat of threatAnalysis.detectedThreats) {
      const severityMultiplier = {
        'low': 1,
        'medium': 2,
        'high': 4,
        'critical': 8
      }[detectedThreat.threat.severity];

      riskScore += severityMultiplier * detectedThreat.confidence;
    }

    // Behavioral pattern modifiers
    if (context.userBehaviorPattern.messageFrequency > 10) riskScore += 2; // Rapid messaging
    if (context.userBehaviorPattern.topicConsistency < 0.3) riskScore += 3; // Topic jumping
    if (context.timeContext.rapidFireDetected) riskScore += 4; // Rapid fire detection

    // Historical violation modifier
    const recentViolations = context.previousViolations.filter(
      v => Date.now() - v.timestamp.getTime() < 300000 // Last 5 minutes
    );
    riskScore += recentViolations.length * 2;

    // Escalation modifier
    const escalationMultiplier = Math.min(3, context.previousViolations.length / 3);
    riskScore *= (1 + escalationMultiplier);

    return Math.min(100, riskScore);
  }

  private determineResponseStrategy(
    riskScore: number, 
    threatAnalysis: ThreatAnalysisResult
  ): ResponseStrategy {
    
    if (riskScore >= 80 || threatAnalysis.maxSeverity === 'critical') {
      return {
        shouldBlock: true,
        responseType: 'firm_boundary',
        message: 'Jag fokuserar på att hjälpa med Axie Studios affärstjänster. Låt oss hålla konversationen professionell.',
        escalationLevel: 'high',
        additionalActions: ['log_security_event', 'increase_monitoring']
      };
    }

    if (riskScore >= 50 || threatAnalysis.maxSeverity === 'high') {
      return {
        shouldBlock: false,
        responseType: 'polite_redirect',
        message: 'Jag är här för att hjälpa dig med digitala lösningar från Axie Studio. Hur kan jag assistera dig med våra tjänster?',
        escalationLevel: 'medium',
        additionalActions: ['log_warning', 'monitor_closely']
      };
    }

    if (riskScore >= 25 || threatAnalysis.maxSeverity === 'medium') {
      return {
        shouldBlock: false,
        responseType: 'gentle_redirect',
        message: 'Låt mig hjälpa dig med information om Axie Studios tjänster istället.',
        escalationLevel: 'low',
        additionalActions: ['log_info']
      };
    }

    return {
      shouldBlock: false,
      responseType: 'normal',
      message: '',
      escalationLevel: 'none',
      additionalActions: []
    };
  }

  private initializeAdaptivePatterns(): void {
    // Patterns that evolve based on user behavior
    this.adaptivePatterns.set('topic_evasion', {
      id: 'topic_evasion',
      description: 'User consistently avoids business topics',
      triggers: ['off_topic_sequence', 'business_topic_avoidance'],
      threshold: 5,
      adaptiveResponse: 'Increase business topic emphasis'
    });

    this.adaptivePatterns.set('manipulation_evolution', {
      id: 'manipulation_evolution',
      description: 'User tries different manipulation tactics',
      triggers: ['multiple_manipulation_types', 'escalating_demands'],
      threshold: 3,
      adaptiveResponse: 'Strengthen boundaries and reduce engagement'
    });
  }

  private checkAdaptivePatterns(message: string, context: SecurityContext): DetectedThreat[] {
    const adaptiveThreats: DetectedThreat[] = [];

    for (const [patternId, pattern] of this.adaptivePatterns) {
      if (this.evaluateAdaptivePattern(pattern, message, context)) {
        adaptiveThreats.push({
          threat: {
            id: patternId,
            type: 'business_disruption',
            severity: 'medium',
            pattern: /adaptive/,
            description: pattern.description,
            countermeasure: pattern.adaptiveResponse,
            escalationThreshold: pattern.threshold
          },
          confidence: 0.8,
          context: 'Adaptive pattern detected'
        });
      }
    }

    return adaptiveThreats;
  }

  private getOrCreateSecurityContext(sessionId: string, conversationHistory: any[]): SecurityContext {
    if (!this.sessionContexts.has(sessionId)) {
      this.sessionContexts.set(sessionId, {
        sessionId,
        conversationHistory,
        userBehaviorPattern: {
          messageFrequency: 0,
          averageMessageLength: 0,
          topicConsistency: 1,
          languagePatterns: [],
          suspiciousPatterns: [],
          engagementLevel: 5
        },
        timeContext: {
          currentTime: new Date(),
          sessionDuration: 0,
          messagesSentInLastMinute: 0,
          rapidFireDetected: false
        },
        previousViolations: [],
        riskScore: 0
      });
    }

    const context = this.sessionContexts.get(sessionId)!;
    context.conversationHistory = conversationHistory;
    return context;
  }

  private updateUserBehaviorPattern(context: SecurityContext, message: string): void {
    const pattern = context.userBehaviorPattern;
    
    // Update message frequency
    pattern.messageFrequency++;
    
    // Update average message length
    const currentLength = message.length;
    pattern.averageMessageLength = (pattern.averageMessageLength + currentLength) / 2;
    
    // Analyze topic consistency
    const currentTopics = this.extractTopics(message);
    const previousTopics = context.conversationHistory
      .slice(-3)
      .filter(msg => msg.role === 'user')
      .flatMap(msg => this.extractTopics(msg.content));
    
    const topicOverlap = currentTopics.filter(topic => previousTopics.includes(topic)).length;
    pattern.topicConsistency = topicOverlap / Math.max(currentTopics.length, 1);
    
    // Detect rapid fire messaging
    const now = new Date();
    const recentMessages = context.conversationHistory
      .filter(msg => msg.role === 'user')
      .filter(msg => now.getTime() - new Date(msg.timestamp).getTime() < 60000);
    
    context.timeContext.messagesSentInLastMinute = recentMessages.length;
    context.timeContext.rapidFireDetected = recentMessages.length > 5;
  }

  private updateSecurityContext(
    context: SecurityContext, 
    message: string, 
    threatAnalysis: ThreatAnalysisResult
  ): void {
    
    // Add violations
    for (const detectedThreat of threatAnalysis.detectedThreats) {
      if (detectedThreat.threat.severity === 'high' || detectedThreat.threat.severity === 'critical') {
        context.previousViolations.push({
          timestamp: new Date(),
          type: detectedThreat.threat.type,
          severity: detectedThreat.threat.severity,
          message: message.substring(0, 100),
          action: detectedThreat.threat.countermeasure,
          resolved: false
        });
      }
    }

    // Update risk score
    context.riskScore = this.calculateDynamicRiskScore(threatAnalysis, context);
  }

  // Helper methods
  private calculateThreatConfidence(threat: SecurityThreat, message: string, context: SecurityContext): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on context
    if (context.previousViolations.some(v => v.type === threat.type)) {
      confidence += 0.2; // Pattern repetition
    }
    
    if (context.userBehaviorPattern.suspiciousPatterns.includes(threat.type)) {
      confidence += 0.1; // Behavioral consistency
    }
    
    return Math.min(1, confidence);
  }

  private extractThreatContext(message: string, threat: SecurityThreat): string {
    return `Threat: ${threat.id}, Message: "${message.substring(0, 50)}..."`;
  }

  private getSeverityLevel(severity: SecurityThreat['severity']): number {
    const levels = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return levels[severity];
  }

  private calculateOverallThreatLevel(threats: DetectedThreat[]): number {
    if (threats.length === 0) return 0;
    
    const totalThreatScore = threats.reduce((sum, threat) => {
      return sum + this.getSeverityLevel(threat.threat.severity) * threat.confidence;
    }, 0);
    
    return Math.min(10, totalThreatScore / threats.length);
  }

  private analyzePatternEvolution(message: string, context: SecurityContext): PatternEvolution {
    return {
      isEvolving: context.previousViolations.length > 3,
      evolutionDirection: 'escalating',
      newPatterns: [],
      adaptationRequired: context.riskScore > 60
    };
  }

  private evaluateAdaptivePattern(pattern: AdaptivePattern, message: string, context: SecurityContext): boolean {
    // Simplified evaluation - in real implementation, this would be more sophisticated
    return context.previousViolations.length >= pattern.threshold;
  }

  private extractTopics(message: string): string[] {
    const businessTopics = ['website', 'app', 'booking', 'price', 'service'];
    const offTopics = ['math', 'geography', 'sports', 'personal'];
    
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    [...businessTopics, ...offTopics].forEach(topic => {
      if (lowerMessage.includes(topic)) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  private isLegitimateBusinessUrgency(message: string): boolean {
    const businessUrgencyKeywords = ['project deadline', 'launch date', 'business critical'];
    return businessUrgencyKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private getAdaptiveActions(context: SecurityContext, threatAnalysis: ThreatAnalysisResult): string[] {
    const actions: string[] = [];
    
    if (context.riskScore > 70) {
      actions.push('increase_monitoring');
    }
    
    if (threatAnalysis.patternEvolution.adaptationRequired) {
      actions.push('update_security_patterns');
    }
    
    return actions;
  }
}

// Interfaces
interface SecurityAnalysisResult {
  isBlocked: boolean;
  riskScore: number;
  threats: DetectedThreat[];
  responseStrategy: ResponseStrategy;
  adaptiveActions: string[];
}

interface ThreatAnalysisResult {
  detectedThreats: DetectedThreat[];
  maxSeverity: SecurityThreat['severity'];
  overallThreatLevel: number;
  patternEvolution: PatternEvolution;
}

interface DetectedThreat {
  threat: SecurityThreat;
  confidence: number;
  context: string;
}

interface ResponseStrategy {
  shouldBlock: boolean;
  responseType: 'normal' | 'gentle_redirect' | 'polite_redirect' | 'firm_boundary';
  message: string;
  escalationLevel: 'none' | 'low' | 'medium' | 'high';
  additionalActions: string[];
}

interface AdaptivePattern {
  id: string;
  description: string;
  triggers: string[];
  threshold: number;
  adaptiveResponse: string;
}

interface PatternEvolution {
  isEvolving: boolean;
  evolutionDirection: 'escalating' | 'de-escalating' | 'stable';
  newPatterns: string[];
  adaptationRequired: boolean;
}

export const advancedSecuritySystem = new AdvancedSecuritySystem();