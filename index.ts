import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

// ============================================
// TYPES
// ============================================

interface TikTokVideo {
  id: string;
  url: string;
  description: string;
  author: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface SearchResult {
  keyword: string;
  timestamp: string;
  videos: TikTokVideo[];
}

interface VideoAnalysis {
  id: string;
  url: string;
  hook: {
    type: string;
    strength: string;
    analysis: string;
  };
  content: {
    format: string;
    pacing: string;
    visualStyle: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
    engagementRate: number;
  };
  themes: string[];
  sentiment: string;
}

interface BriefSection {
  title: string;
  content: string;
}

// ============================================
// MIDDLEWARE
// ============================================

app.use("*", cors());

// ============================================
// ENDPOINTS
// ============================================

// Health check
app.get("/", (c) => {
  return c.json({ 
    status: "ok", 
    service: "TikTok Research Agent API",
    version: "1.0.0",
    endpoints: {
      "POST /api/search": "Search TikTok (accepts video data)",
      "POST /api/analyze": "Analyze videos with AI",
      "POST /api/brief": "Generate creative brief"
    }
  });
});

// Search endpoint - accepts video data from external source
app.post("/api/search", async (c) => {
  const body = await c.req.json();
  
  const { keyword, videos } = body;
  
  if (!keyword || !videos || !Array.isArray(videos)) {
    return c.json({ error: "Missing keyword or videos array" }, 400);
  }

  const result: SearchResult = {
    keyword,
    timestamp: new Date().toISOString(),
    videos: videos.map((v: Partial<TikTokVideo>) => ({
      id: v.id || "",
      url: v.url || "",
      description: v.description || "",
      author: v.author || "",
      likes: v.likes || 0,
      comments: v.comments || 0,
      shares: v.shares || 0,
      views: v.views || 0,
    }))
  };

  return c.json(result);
});

// Analyze endpoint - AI analysis of videos
app.post("/api/analyze", async (c) => {
  const body = await c.req.json();
  
  const { videos, includeComments } = body;
  
  if (!videos || !Array.isArray(videos)) {
    return c.json({ error: "Missing videos array" }, 400);
  }

  // Check for AI prompt in request or use default
  const aiPrompt = body.aiPrompt || null;
  
  const analyses: VideoAnalysis[] = videos.map((video: TikTokVideo) => {
    // Determine hook type based on description
    let hookType = "informational";
    const desc = video.description.toLowerCase();
    
    if (desc.includes("?") || desc.includes("how to") || desc.includes("what is")) {
      hookType = "question";
    } else if (desc.includes("!") || desc.includes("wow") || desc.includes("secret")) {
      hookType = "urgency";
    } else if (desc.includes("this") || desc.includes("try this") || desc.includes("hack")) {
      hookType = "instructional";
    } else if (desc.includes("vs") || desc.includes("better") || desc.includes("worst")) {
      hookType = "comparison";
    }

    // Determine content format
    let format = "story";
    if (desc.includes("routine") || desc.includes("step")) format = "list";
    else if (desc.includes("review") || desc.includes("try")) format = "demo";
    else if (desc.includes("tips") || desc.includes("hack")) format = "educational";

    const engagementRate = video.views > 0 
      ? ((video.likes + video.comments + video.shares) / video.views) * 100 
      : 0;

    return {
      id: video.id,
      url: video.url,
      hook: {
        type: hookType,
        strength: engagementRate > 5 ? "high" : "medium",
        analysis: getHookAnalysis(hookType, video.description),
      },
      content: {
        format,
        pacing: video.views > 1000000 ? "fast" : "medium",
        visualStyle: "authentic, mobile-first",
      },
      engagement: {
        likes: video.likes,
        comments: video.comments,
        shares: video.shares,
        views: video.views,
        engagementRate: Math.round(engagementRate * 100) / 100,
      },
      themes: extractThemes(video.description),
      sentiment: "positive",
    };
  });

  // If AI prompt provided, return prompt for external AI processing
  if (aiPrompt) {
    return c.json({
      prompt: aiPrompt,
      videos: analyses,
      instruction: "Send these analyses to your AI with the provided prompt for enhanced insights"
    });
  }

  return c.json({
    timestamp: new Date().toISOString(),
    analyzedCount: analyses.length,
    analyses,
    summary: generateSummary(analyses),
  });
});

// Brief endpoint - generates creative brief
app.post("/api/brief", async (c) => {
  const body = await c.req.json();
  
  const { analyses, clientName, projectName, brandBible } = body;
  
  if (!analyses || !Array.isArray(analyses)) {
    return c.json({ error: "Missing analyses array" }, 400);
  }

  const client = clientName || "Client";
  const project = projectName || "TikTok Content Strategy";
  const date = new Date().toLocaleDateString();

  // Calculate metrics
  let totalViews = 0;
  let totalLikes = 0;
  const allThemes: string[] = [];
  const hookTypes: Record<string, number> = {};

  analyses.forEach((a: VideoAnalysis) => {
    totalViews += a.engagement.views;
    totalLikes += a.engagement.likes;
    a.themes.forEach(t => allThemes.push(t));
    hookTypes[a.hook.type] = (hookTypes[a.hook.type] || 0) + 1;
  });

  const avgEngagement = analyses.reduce((sum, a) => sum + a.engagement.engagementRate, 0) / analyses.length;
  const topHook = Object.entries(hookTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || "informational";

  // Generate brief sections
  const brief = {
    metadata: {
      client,
      project,
      date,
      videosAnalyzed: analyses.length,
    },
    sections: {
      executiveSummary: {
        title: "Executive Summary",
        content: `This brief analyzes ${analyses.length} TikTok videos in the ${client} category. Key findings: ${(totalViews / 1000000).toFixed(1)}M total views, ${avgEngagement.toFixed(1)}% avg engagement rate. Top performing hook type: ${topHook}.`,
      },
      researchFindings: {
        title: "Research Findings",
        content: {
          topVideos: analyses.slice(0, 5).map((a, i) => ({
            rank: i + 1,
            url: a.url,
            views: a.engagement.views,
            engagement: `${a.engagement.engagementRate}%`,
          })),
          metrics: {
            totalViews,
            totalLikes,
            avgEngagement: Math.round(avgEngagement * 100) / 100,
          },
        },
      },
      keyInsights: {
        title: "Key Insights",
        content: {
          hooks: {
            topHook,
            types: hookTypes,
            recommendation: getHookRecommendation(topHook),
          },
          themes: [...new Set(allThemes)].slice(0, 10),
        },
      },
      recommendations: {
        title: "Recommendations",
        content: {
          formats: getRecommendedFormats(analyses),
          strategy: {
            frequency: "4-6 videos/week",
            bestTimes: ["6-9 AM", "12-2 PM", "7-10 PM"],
            hashtagStrategy: "3-5 niche + 2 trending",
          },
        },
      },
      actionItems: {
        title: "Action Items",
        content: [
          "Review top performing videos for reference",
          "Create hook library based on research",
          "Develop content pillars",
          "Brief creative team",
          "Set up competitor tracking",
          "Plan content calendar",
        ],
      },
    },
  };

  // Apply brand bible overrides if provided
  if (brandBible) {
    if (brandBible.brandVoice) {
      (brief.sections as any).brandVoice = {
        title: "Brand Voice",
        content: brandBible.brandVoice,
      };
    }
    if (brandBible.targetAudience) {
      (brief.sections as any).targetAudience = {
        title: "Target Audience",
        content: brandBible.targetAudience,
      };
    }
  }

  return c.json(brief);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getHookAnalysis(type: string, description: string): string {
  const analyses: Record<string, string> = {
    question: "Asks viewer something they want answered - high curiosity potential",
    urgency: "Creates FOMO with exclamation/emphasis - drives immediate action",
    instructional: "Promises teachable moment - saves-worthy content",
    comparison: "Satisfies viewer desire to make informed decisions",
    informational: "Sets up expectation for valuable content",
  };
  return analyses[type] || analyses.informational;
}

function extractThemes(description: string): string[] {
  const themeKeywords = [
    "routine", "tips", "hack", "review", "routine", "demo", 
    "before", "after", "transformation", "product", "ingredient",
    "skin", "care", "morning", "night", "cleanser", "moisturizer"
  ];
  
  const desc = description.toLowerCase();
  return themeKeywords.filter(t => desc.includes(t)).slice(0, 5);
}

function generateSummary(analyses: VideoAnalysis[]): object {
  const totalViews = analyses.reduce((sum, a) => sum + a.engagement.views, 0);
  const totalLikes = analyses.reduce((sum, a) => sum + a.engagement.likes, 0);
  const avgEngagement = analyses.reduce((sum, a) => sum + a.engagement.engagementRate, 0) / analyses.length;
  
  const hookTypes: Record<string, number> = {};
  analyses.forEach(a => {
    hookTypes[a.hook.type] = (hookTypes[a.hook.type] || 0) + 1;
  });

  return {
    totalViews,
    totalLikes,
    avgEngagement: Math.round(avgEngagement * 100) / 100,
    topHookType: Object.entries(hookTypes).sort((a, b) => b[1] - a[1])[0]?.[0],
  };
}

function getHookRecommendation(hookType: string): string {
  const recommendations: Record<string, string> = {
    question: "Lead with questions your target audience asks. Test 'How many of you...' statements.",
    urgency: "Use sparingly for maximum impact. Save for product launches and limited offers.",
    instructional: "Most versatile format. Position as 'Here's how to...' for maximum save rate.",
    comparison: "Effective for product differentiation. Be specific and back with evidence.",
    informational: "Strong for educational brands. Focus on unique insights only you can share.",
  };
  return recommendations[hookType] || recommendations.informational;
}

function getRecommendedFormats(analyses: VideoAnalysis[]): string[] {
  const formats = analyses.map(a => a.content.format);
  const formatCounts: Record<string, number> = {};
  formats.forEach(f => formatCounts[f] = (formatCounts[f] || 0) + 1);
  
  return Object.entries(formatCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([format]) => {
      const labels: Record<string, string> = {
        list: "Step-by-step tutorials",
        story: "Narrative/ Story format",
        demo: "Product demonstrations",
        educational: "Tips and hacks",
      };
      return labels[format] || format;
    });
}

export default app;
