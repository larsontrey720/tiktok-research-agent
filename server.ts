import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

interface TikTokVideo {
  id: string;
  url: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface BrandBible {
  brandVoice?: string;
  brandValues?: string[];
  targetAudience?: string;
}

// =========================
// Helper: Call Zo API (MiniMax)
// =========================
async function callZo(prompt: string): Promise<string> {
  const response = await fetch("https://api.zo.computer/zo/ask", {
    method: "POST",
    headers: {
      "Authorization": process.env.ZO_CLIENT_IDENTITY_TOKEN || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: prompt,
      model_name: "vercel:minimax/minimax-m2.5",
    }),
  });

  const data = await response.json();
  return data.output || data.error || "No response";
}

// =========================
// GET / - Health check
// =========================
app.get("/", (c) => {
  return c.json({
    status: "ok",
    service: "TikTok Research Agent API",
    version: "1.0.0",
    ai: "MiniMax via Zo API",
    endpoints: ["/api/analyze", "/api/brief"],
  });
});

// =========================
// POST /api/analyze - Analyze videos with AI
// =========================
app.post("/api/analyze", async (c) => {
  const body = await c.req.json<{ videos: TikTokVideo[] }>();
  const { videos } = body;

  if (!videos || videos.length === 0) {
    return c.json({ error: "No videos provided" }, 400);
  }

  const analyses = await Promise.all(
    videos.map(async (video) => {
      const prompt = `
Analyze this TikTok video and return JSON with insights:

VIDEO DATA:
- URL: ${video.url}
- Description: ${video.description}
- Likes: ${video.likes.toLocaleString()}
- Comments: ${video.comments.toLocaleString()}
- Shares: ${video.shares.toLocaleString()}
- Views: ${video.views.toLocaleString()}

Return JSON (no other text):
{
  "hook": {
    "type": "question|bold_statement|problem_solution|trend_jack|behind_scenes|other",
    "strength": "high|medium|low",
    "analysis": "2-3 sentence hook analysis"
  },
  "content": {
    "format": "tutorial|list|story|demo|ugc|transformation|other",
    "pacing": "fast|medium|slow",
    "visualStyle": "authentic|polished|mixed"
  },
  "engagement": {
    "likes": ${video.likes},
    "comments": ${video.comments},
    "shares": ${video.shares},
    "views": ${video.views},
    "engagementRate": ${((video.likes + video.comments + video.shares) / video.views * 100).toFixed(2)}
  },
  "themes": ["theme1", "theme2"],
  "sentiment": "positive|neutral|mixed",
  "audienceQuestions": ["question1", "question2"]
}
`.trim();

      try {
        const result = await callZo(prompt);
        const parsed = JSON.parse(result);
        return { id: video.id, url: video.url, ...parsed };
      } catch (e) {
        // Fallback if parsing fails
        return {
          id: video.id,
          url: video.url,
          hook: { type: "other", strength: "medium", analysis: "Analysis unavailable" },
          content: { format: "other", pacing: "medium", visualStyle: "authentic" },
          engagement: {
            likes: video.likes,
            comments: video.comments,
            shares: video.shares,
            views: video.views,
            engagementRate: ((video.likes + video.comments + video.shares) / video.views * 100).toFixed(2),
          },
          themes: [],
          sentiment: "neutral",
          audienceQuestions: [],
        };
      }
    })
  );

  const totalViews = analyses.reduce((sum, a) => sum + (a.engagement?.views || 0), 0);
  const avgEngagement = analyses.reduce((sum, a) => sum + parseFloat(a.engagement?.engagementRate || "0"), 0) / analyses.length;

  return c.json({
    timestamp: new Date().toISOString(),
    analyzedCount: analyses.length,
    analyses,
    summary: {
      totalViews,
      avgEngagement: avgEngagement.toFixed(2),
    },
  });
});

// =========================
// POST /api/brief - Generate creative brief
// =========================
app.post("/api/brief", async (c) => {
  const { clientName, analyses, brandBible } = await c.req.json() as {
    clientName: string;
    analyses: any[];
    brandBible?: BrandBible;
  };

  const briefPrompt = `
You are a creative strategist. Generate a professional creative brief based on TikTok research.

CLIENT: ${clientName}
${brandBible ? `
BRAND BIBLE:
- Voice: ${brandBible.brandVoice || "Not specified"}
- Values: ${brandBible.brandValues?.join(", ") || "Not specified"}
- Audience: ${brandBible.targetAudience || "Not specified"}
` : ""}

VIDEO ANALYSES:
${analyses.map((a) => `
- ${a.hook?.type || "unknown"} hook (${a.hook?.strength || "?"} strength)
- Format: ${a.content?.format || "?"} | ${a.content?.pacing || "?"} pacing
- Themes: ${a.themes?.join(", ") || "none detected"}
- Sentiment: ${a.sentiment || "?"}
- Engagement: ${a.engagement?.likes?.toLocaleString() || 0} likes (${a.engagement?.engagementRate || 0}%)
`).join("\n")}

Generate a creative brief with these sections:
1. Executive Summary (2-3 sentences)
2. Research Findings (top videos, engagement metrics)
3. Key Insights (what hooks, themes, formats work)
4. Recommendations (content pillars, posting strategy)
5. Action Items (next steps)

Format as markdown.
`.trim();

  const brief = await callZo(briefPrompt);

  return c.json({
    clientName,
    timestamp: new Date().toISOString(),
    brief,
  });
});

export default app;
