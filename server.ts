import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

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

interface VideoAnalysis {
  id: string;
  url: string;
  hook: { type: string; strength: string; analysis: string };
  content: { format: string; pacing: string; visualStyle: string };
  engagement: { likes: number; comments: number; shares: number; views: number; engagementRate: number };
  themes: string[];
  sentiment: string;
}

app.use("*", cors());

app.get("/", (c) => c.json({ status: "ok", service: "TikTok Research Agent API", version: "1.0.0" }));

app.post("/api/search", async (c) => {
  const { keyword, videos } = await c.req.json();
  if (!keyword || !videos) return c.json({ error: "Missing data" }, 400);
  return c.json({ keyword, timestamp: new Date().toISOString(), videos });
});

app.post("/api/analyze", async (c) => {
  const { videos } = await c.req.json();
  if (!videos) return c.json({ error: "Missing videos" }, 400);

  const analyses: VideoAnalysis[] = videos.map((video: TikTokVideo) => {
    const desc = video.description.toLowerCase();
    const hookType = desc.includes("?") ? "question" : desc.includes("!") ? "urgency" : desc.includes("hack") ? "instructional" : "informational";
    const format = desc.includes("routine") ? "list" : desc.includes("review") ? "demo" : "story";
    const engagementRate = video.views > 0 ? ((video.likes + video.comments + video.shares) / video.views) * 100 : 0;
    
    return {
      id: video.id, url: video.url,
      hook: { type: hookType, strength: engagementRate > 5 ? "high" : "medium", analysis: "Hook analysis" },
      content: { format, pacing: video.views > 1000000 ? "fast" : "medium", visualStyle: "authentic" },
      engagement: { likes: video.likes, comments: video.comments, shares: video.shares, views: video.views, engagementRate: Math.round(engagementRate * 100) / 100 },
      themes: ["skincare", "routine"].filter(t => desc.includes(t)),
      sentiment: "positive",
    };
  });

  const totalViews = analyses.reduce((s, a) => s + a.engagement.views, 0);
  const avgEngagement = analyses.reduce((s, a) => s + a.engagement.engagementRate, 0) / analyses.length;

  return c.json({ timestamp: new Date().toISOString(), analyzedCount: analyses.length, analyses, summary: { totalViews, avgEngagement: Math.round(avgEngagement * 100) / 100 } });
});

app.post("/api/brief", async (c) => {
  const { analyses, clientName, brandBible } = await c.req.json();
  if (!analyses) return c.json({ error: "Missing analyses" }, 400);

  const totalViews = analyses.reduce((s: number, a: VideoAnalysis) => s + a.engagement.views, 0);
  const avgEngagement = analyses.reduce((s: number, a: VideoAnalysis) => s + a.engagement.engagementRate, 0) / analyses.length;

  return c.json({
    metadata: { client: clientName || "Client", date: new Date().toLocaleDateString(), videosAnalyzed: analyses.length },
    sections: {
      executiveSummary: { title: "Executive Summary", content: `Analyzed ${analyses.length} videos. ${(totalViews/1000000).toFixed(1)}M views, ${avgEngagement.toFixed(1)}% avg engagement.` },
      recommendations: { title: "Recommendations", content: { frequency: "4-6/week", formats: ["tutorials", "demos", "UGC"] } },
    }
  });
});

export default app;
