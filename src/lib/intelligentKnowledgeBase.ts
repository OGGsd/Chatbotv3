// Intelligent Knowledge Base System with Advanced Context Understanding

import { conversationEngine, ConversationState } from './conversationEngine';

interface KnowledgeContext {
  userProfile: any;
  conversationStage: string;
  businessContext: any;
  previousQuestions: string[];
  currentNeed: string;
}

interface IntelligentResponse {
  content: string;
  confidence: number;
  sources: string[];
  followUpQuestions: string[];
  relatedTopics: string[];
  personalizedRecommendations: string[];
}

class IntelligentKnowledgeBase {
  private knowledgeGraph: Map<string, KnowledgeNode> = new Map();
  private contextualResponses: Map<string, ContextualResponse[]> = new Map();
  private userJourneyMaps: Map<string, UserJourneyStep[]> = new Map();
  private businessLogicRules: BusinessRule[] = [];

  constructor() {
    this.initializeKnowledgeGraph();
    this.initializeContextualResponses();
    this.initializeUserJourneyMaps();
    this.initializeBusinessLogicRules();
  }

  // Advanced knowledge retrieval with context awareness
  getIntelligentResponse(
    query: string, 
    conversationState: ConversationState,
    knowledgeFiles: any[]
  ): IntelligentResponse {
    
    // Analyze query context
    const queryContext = this.analyzeQueryContext(query, conversationState);
    
    // Find relevant knowledge nodes
    const relevantNodes = this.findRelevantKnowledgeNodes(query, queryContext);
    
    // Apply business logic rules
    const filteredContent = this.applyBusinessLogicRules(relevantNodes, conversationState);
    
    // Personalize response based on user profile
    const personalizedContent = this.personalizeResponse(filteredContent, conversationState);
    
    // Generate contextual recommendations
    const recommendations = this.generateRecommendations(queryContext, conversationState);
    
    // Calculate confidence score
    const confidence = this.calculateConfidenceScore(relevantNodes, queryContext);
    
    return {
      content: personalizedContent,
      confidence,
      sources: relevantNodes.map(node => node.source),
      followUpQuestions: this.generateFollowUpQuestions(queryContext),
      relatedTopics: this.findRelatedTopics(queryContext),
      personalizedRecommendations: recommendations
    };
  }

  private analyzeQueryContext(query: string, state: ConversationState): QueryContext {
    const lowerQuery = query.toLowerCase();
    
    return {
      intent: this.detectQueryIntent(lowerQuery),
      complexity: this.assessQueryComplexity(lowerQuery),
      technicalLevel: state.userProfile.technicalLevel,
      businessContext: state.businessContext,
      conversationStage: state.stage,
      userHistory: state.conversationHistory.slice(-5),
      urgencyLevel: this.detectUrgencyLevel(lowerQuery),
      specificityLevel: this.assessSpecificity(lowerQuery),
      emotionalTone: this.detectEmotionalTone(lowerQuery)
    };
  }

  private findRelevantKnowledgeNodes(query: string, context: QueryContext): KnowledgeNode[] {
    const nodes: KnowledgeNode[] = [];
    
    // Semantic search through knowledge graph
    for (const [key, node] of this.knowledgeGraph) {
      const relevanceScore = this.calculateRelevanceScore(query, node, context);
      if (relevanceScore > 0.3) {
        nodes.push({ ...node, relevanceScore });
      }
    }
    
    // Sort by relevance and context appropriateness
    return nodes
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 5);
  }

  private applyBusinessLogicRules(nodes: KnowledgeNode[], state: ConversationState): string {
    let content = '';
    
    // Apply rules based on conversation stage
    const applicableRules = this.businessLogicRules.filter(rule => 
      rule.conditions.every(condition => this.evaluateCondition(condition, state))
    );
    
    // Process nodes through business rules
    for (const node of nodes) {
      const processedContent = this.processNodeThroughRules(node, applicableRules, state);
      content += processedContent + '\n\n';
    }
    
    return content.trim();
  }

  private personalizeResponse(content: string, state: ConversationState): string {
    let personalizedContent = content;
    
    // Adjust language complexity based on technical level
    if (state.userProfile.technicalLevel === 'beginner') {
      personalizedContent = this.simplifyTechnicalLanguage(personalizedContent);
    } else if (state.userProfile.technicalLevel === 'advanced') {
      personalizedContent = this.addTechnicalDetails(personalizedContent);
    }
    
    // Adjust communication style
    if (state.userProfile.communicationStyle === 'formal') {
      personalizedContent = this.makeFormal(personalizedContent);
    } else if (state.userProfile.communicationStyle === 'casual') {
      personalizedContent = this.makeCasual(personalizedContent);
    }
    
    // Add industry-specific context
    if (state.businessContext.industry) {
      personalizedContent = this.addIndustryContext(personalizedContent, state.businessContext.industry);
    }
    
    return personalizedContent;
  }

  private generateRecommendations(context: QueryContext, state: ConversationState): string[] {
    const recommendations: string[] = [];
    
    // Stage-based recommendations
    switch (state.stage) {
      case 'discovery':
        recommendations.push('Utforska våra olika tjänstepaket för att hitta den bästa lösningen');
        break;
      case 'consideration':
        recommendations.push('Boka en kostnadsfri konsultation för att diskutera dina specifika behov');
        break;
      case 'evaluation':
        recommendations.push('Jämför våra paket för att se vilket som passar ditt företag bäst');
        break;
    }
    
    // Interest-based recommendations
    if (state.interestLevel === 'engaged') {
      recommendations.push('Se exempel på tidigare projekt inom din bransch');
    }
    
    // Context-based recommendations
    if (context.urgencyLevel > 7) {
      recommendations.push('Vi kan starta ditt projekt inom 48 timmar efter bekräftelse');
    }
    
    return recommendations;
  }

  private initializeKnowledgeGraph(): void {
    // Create semantic relationships between concepts
    this.knowledgeGraph.set('website_pricing', {
      id: 'website_pricing',
      content: 'Webbplats: 8,995 kr startavgift + 495 kr/månad',
      category: 'pricing',
      tags: ['website', 'pricing', 'cost'],
      relationships: ['website_features', 'website_benefits'],
      contextRelevance: {
        stages: ['consideration', 'evaluation'],
        intents: ['price_inquiry'],
        technicalLevels: ['beginner', 'intermediate', 'advanced']
      },
      source: 'company-services-sv.txt'
    });
    
    this.knowledgeGraph.set('website_features', {
      id: 'website_features',
      content: 'Responsiv design, SEO-optimering, SSL-certifikat, 24/7 support',
      category: 'features',
      tags: ['website', 'features', 'technical'],
      relationships: ['website_pricing', 'website_benefits'],
      contextRelevance: {
        stages: ['education', 'consideration'],
        intents: ['service_inquiry', 'technical'],
        technicalLevels: ['intermediate', 'advanced']
      },
      source: 'company-services-sv.txt'
    });
    
    // Add more knowledge nodes...
  }

  private initializeContextualResponses(): void {
    // Responses tailored to different contexts
    this.contextualResponses.set('price_inquiry_beginner', [
      {
        condition: { stage: 'discovery', technicalLevel: 'beginner' },
        response: 'Våra priser är transparenta och inkluderar allt du behöver för att komma igång.',
        followUp: 'Vill du veta mer om vad som ingår i priset?'
      }
    ]);
    
    this.contextualResponses.set('price_inquiry_advanced', [
      {
        condition: { stage: 'evaluation', technicalLevel: 'advanced' },
        response: 'Här är en detaljerad kostnadsuppdelning med tekniska specifikationer.',
        followUp: 'Behöver du information om API-integration eller hosting-arkitektur?'
      }
    ]);
  }

  private initializeUserJourneyMaps(): void {
    // Map user journeys for different personas
    this.userJourneyMaps.set('small_business_owner', [
      {
        stage: 'awareness',
        needs: ['online_presence', 'customer_acquisition'],
        content: 'Förklara värdet av professionell webbplats',
        nextSteps: ['education']
      },
      {
        stage: 'consideration',
        needs: ['cost_understanding', 'feature_comparison'],
        content: 'Visa prispaket och funktioner',
        nextSteps: ['evaluation', 'consultation']
      }
    ]);
  }

  private initializeBusinessLogicRules(): void {
    this.businessLogicRules = [
      {
        id: 'pricing_disclosure_rule',
        conditions: [
          { type: 'intent', value: 'price_inquiry' },
          { type: 'stage', value: ['consideration', 'evaluation'] }
        ],
        actions: [
          { type: 'include_exact_pricing', priority: 'high' },
          { type: 'add_value_proposition', priority: 'medium' }
        ]
      },
      {
        id: 'technical_detail_rule',
        conditions: [
          { type: 'technical_level', value: 'advanced' },
          { type: 'intent', value: 'technical' }
        ],
        actions: [
          { type: 'include_technical_specs', priority: 'high' },
          { type: 'mention_integrations', priority: 'medium' }
        ]
      },
      {
        id: 'beginner_simplification_rule',
        conditions: [
          { type: 'technical_level', value: 'beginner' }
        ],
        actions: [
          { type: 'simplify_language', priority: 'high' },
          { type: 'add_explanations', priority: 'medium' }
        ]
      }
    ];
  }

  // Helper methods
  private detectQueryIntent(query: string): string {
    const intentPatterns = {
      'detailed_pricing': /\b(exakt pris|exact price|detaljerad kostnad|detailed cost)\b/i,
      'feature_comparison': /\b(jämför|compare|skillnad|difference|funktioner|features)\b/i,
      'technical_specs': /\b(teknisk|technical|specifikation|specification|integration)\b/i,
      'timeline': /\b(tid|time|leverans|delivery|när|when)\b/i,
      'support': /\b(support|hjälp|help|problem|issue)\b/i
    };

    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(query)) return intent;
    }
    
    return 'general_inquiry';
  }

  private calculateRelevanceScore(query: string, node: KnowledgeNode, context: QueryContext): number {
    let score = 0;
    
    // Keyword matching
    const queryWords = query.toLowerCase().split(' ');
    const nodeWords = (node.content + ' ' + node.tags.join(' ')).toLowerCase();
    const matchingWords = queryWords.filter(word => nodeWords.includes(word));
    score += (matchingWords.length / queryWords.length) * 0.4;
    
    // Context relevance
    if (node.contextRelevance.stages.includes(context.conversationStage)) score += 0.3;
    if (node.contextRelevance.intents.includes(context.intent)) score += 0.2;
    if (node.contextRelevance.technicalLevels.includes(context.technicalLevel)) score += 0.1;
    
    return Math.min(1, score);
  }

  private evaluateCondition(condition: BusinessRuleCondition, state: ConversationState): boolean {
    switch (condition.type) {
      case 'stage':
        return Array.isArray(condition.value) 
          ? condition.value.includes(state.stage)
          : condition.value === state.stage;
      case 'technical_level':
        return condition.value === state.userProfile.technicalLevel;
      case 'intent':
        return condition.value === 'price_inquiry'; // Simplified for example
      default:
        return false;
    }
  }

  private processNodeThroughRules(node: KnowledgeNode, rules: BusinessRule[], state: ConversationState): string {
    let processedContent = node.content;
    
    for (const rule of rules) {
      for (const action of rule.actions) {
        switch (action.type) {
          case 'include_exact_pricing':
            if (node.category === 'pricing') {
              processedContent = this.enhanceWithExactPricing(processedContent);
            }
            break;
          case 'simplify_language':
            processedContent = this.simplifyTechnicalLanguage(processedContent);
            break;
          case 'include_technical_specs':
            if (node.category === 'features') {
              processedContent = this.addTechnicalDetails(processedContent);
            }
            break;
        }
      }
    }
    
    return processedContent;
  }

  // Content transformation methods
  private simplifyTechnicalLanguage(content: string): string {
    const technicalTerms = {
      'responsiv design': 'design som fungerar på alla enheter',
      'SEO-optimering': 'optimering för att synas bättre på Google',
      'SSL-certifikat': 'säkerhetscertifikat för din webbplats',
      'API-integration': 'koppling till andra system'
    };
    
    let simplified = content;
    for (const [technical, simple] of Object.entries(technicalTerms)) {
      simplified = simplified.replace(new RegExp(technical, 'gi'), `${technical} (${simple})`);
    }
    
    return simplified;
  }

  private addTechnicalDetails(content: string): string {
    // Add technical specifications for advanced users
    return content + '\n\nTekniska detaljer: React/Vue.js frontend, Node.js backend, PostgreSQL databas, AWS hosting.';
  }

  private enhanceWithExactPricing(content: string): string {
    return content + '\n\nPriset inkluderar: hosting, domän, SSL-certifikat, regelbundna uppdateringar och 24/7 support.';
  }

  private makeFormal(content: string): string {
    return content.replace(/\bvi\b/gi, 'Vi').replace(/\bdu\b/gi, 'Ni');
  }

  private makeCasual(content: string): string {
    return content.replace(/\bNi\b/gi, 'du').replace(/\bEr\b/gi, 'din');
  }

  private addIndustryContext(content: string, industry: string): string {
    const industryContexts = {
      'healthcare': 'Med GDPR-compliance och säkra patientdata-hantering.',
      'ecommerce': 'Med integrerade betalningslösningar och lagerhantering.',
      'restaurant': 'Med bokningssystem och online-beställningar.'
    };
    
    const context = industryContexts[industry as keyof typeof industryContexts];
    return context ? content + '\n\n' + context : content;
  }

  private generateFollowUpQuestions(context: QueryContext): string[] {
    const questions: string[] = [];
    
    switch (context.intent) {
      case 'price_inquiry':
        questions.push('Vilken typ av funktionalitet är viktigast för dig?');
        questions.push('Har du en specifik budget i åtanke?');
        break;
      case 'technical_specs':
        questions.push('Behöver du integration med befintliga system?');
        questions.push('Vilka tekniska krav har du?');
        break;
    }
    
    return questions;
  }

  private findRelatedTopics(context: QueryContext): string[] {
    const relatedTopics: string[] = [];
    
    if (context.intent === 'price_inquiry') {
      relatedTopics.push('Funktioner som ingår', 'Supportnivåer', 'Leveranstid');
    }
    
    return relatedTopics;
  }

  private assessQueryComplexity(query: string): number {
    const words = query.split(' ').length;
    const technicalTerms = ['integration', 'api', 'database', 'hosting'].filter(term => 
      query.toLowerCase().includes(term)
    ).length;
    
    return Math.min(10, words / 5 + technicalTerms * 2);
  }

  private detectUrgencyLevel(query: string): number {
    const urgencyKeywords = ['snabbt', 'quickly', 'asap', 'nu', 'now', 'omedelbart'];
    return urgencyKeywords.some(keyword => query.toLowerCase().includes(keyword)) ? 8 : 3;
  }

  private assessSpecificity(query: string): number {
    const specificKeywords = ['exakt', 'exact', 'specifik', 'specific', 'detalj', 'detail'];
    return specificKeywords.some(keyword => query.toLowerCase().includes(keyword)) ? 8 : 5;
  }

  private detectEmotionalTone(query: string): 'positive' | 'neutral' | 'negative' | 'frustrated' {
    const positiveWords = ['bra', 'excellent', 'perfect', 'love'];
    const negativeWords = ['dålig', 'terrible', 'hate', 'awful'];
    const frustratedWords = ['varför', 'why', 'problem', 'inte fungerar', 'not working'];
    
    if (frustratedWords.some(word => query.toLowerCase().includes(word))) return 'frustrated';
    if (positiveWords.some(word => query.toLowerCase().includes(word))) return 'positive';
    if (negativeWords.some(word => query.toLowerCase().includes(word))) return 'negative';
    return 'neutral';
  }

  private calculateConfidenceScore(nodes: KnowledgeNode[], context: QueryContext): number {
    if (nodes.length === 0) return 0.1;
    
    const avgRelevance = nodes.reduce((sum, node) => sum + (node.relevanceScore || 0), 0) / nodes.length;
    const contextBonus = context.specificityLevel > 6 ? 0.2 : 0;
    
    return Math.min(0.95, avgRelevance + contextBonus);
  }
}

// Interfaces
interface KnowledgeNode {
  id: string;
  content: string;
  category: string;
  tags: string[];
  relationships: string[];
  contextRelevance: {
    stages: string[];
    intents: string[];
    technicalLevels: string[];
  };
  source: string;
  relevanceScore?: number;
}

interface ContextualResponse {
  condition: {
    stage?: string;
    technicalLevel?: string;
    intent?: string;
  };
  response: string;
  followUp: string;
}

interface UserJourneyStep {
  stage: string;
  needs: string[];
  content: string;
  nextSteps: string[];
}

interface BusinessRule {
  id: string;
  conditions: BusinessRuleCondition[];
  actions: BusinessRuleAction[];
}

interface BusinessRuleCondition {
  type: 'stage' | 'intent' | 'technical_level' | 'interest_level';
  value: string | string[];
}

interface BusinessRuleAction {
  type: string;
  priority: 'low' | 'medium' | 'high';
}

interface QueryContext {
  intent: string;
  complexity: number;
  technicalLevel: string;
  businessContext: any;
  conversationStage: string;
  userHistory: any[];
  urgencyLevel: number;
  specificityLevel: number;
  emotionalTone: string;
}

export const intelligentKnowledgeBase = new IntelligentKnowledgeBase();