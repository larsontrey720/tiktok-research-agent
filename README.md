# TikTok Research Agent API

A research-to-brief pipeline that analyzes TikTok videos and generates creative briefs using MiniMax AI via Zo API.

## Two Hosting Options

### Option 1: zo.space (Recommended - No Setup)

Your API is already live at: **https://georgeo.zo.space/api/tiktok**

```bash
# Analyze videos
curl -X POST https://georgeo.zo.space/api/tiktok \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze",
    "videos": [
      {
        "id": "123456789",
        "url": "https://www.tiktok.com/@username/video/123456789",
        "description": "My skincare routine #skincare #beauty",
        "likes": 100000,
        "comments": 5000,
        "shares": 2000,
        "views": 500000
      }
    ]
  }'

# Generate brief
curl -X POST https://georgeo.zo.space/api/tiktok \
  -H "Content-Type: application/json" \
  -d '{
    "action": "brief",
    "clientName": "YourBrand",
    "analyses": [...],
    "brandBible": {"brandVoice": "confident", "targetAudience": "Women 18-34"}
  }'
```

### Option 2: Vercel (Self-Hosted)

```bash
git clone https://github.com/larsontrey720/tiktok-research-agent.git
cd tiktok-research-agent/api
vercel deploy --prod
```

Then add `ZO_CLIENT_IDENTITY_TOKEN` as an environment variable in Vercel.

## API Reference

### Single Endpoint: POST /api/tiktok

Pass `action` in the body to choose what to do.

#### Action: analyze

```json
{
  "action": "analyze",
  "videos": [
    {
      "id": "string",
      "url": "string", 
      "description": "string",
      "likes": number,
      "comments": number,
      "shares": number,
      "views": number
    }
  ]
}
```

**Response:**
```json
{
  "timestamp": "2026-03-12T...",
  "action": "analyze",
  "analyzedCount": 1,
  "analyses": [{
    "id": "123456789",
    "hook": {"type": "list", "strength": "high", "analysis": "..."},
    "content": {"format": "tutorial", "pacing": "medium", "visualStyle": "polished"},
    "engagement": {"likes": 100000, "comments": 5000, "shares": 2000, "views": 500000, "engagementRate": 20.14},
    "themes": ["skincare", "beauty"],
    "sentiment": "positive",
    "audienceQuestions": ["What products?", "How long?"]
  }],
  "summary": {"totalViews": 500000, "avgEngagement": 20.14}
}
```

#### Action: brief

```json
{
  "action": "brief",
  "clientName": "YourBrand",
  "analyses": [...],  // Output from analyze action
  "brandBible": {
    "brandVoice": "confident",
    "targetAudience": "Women 18-34"
  }
}
```

**Response:**
```json
{
  "timestamp": "2026-03-12T...",
  "action": "brief",
  "clientName": "YourBrand",
  "brief": "# Creative Brief\n\n## Executive Summary\n..."
}
```

## Integration Example

```javascript
const API_URL = "https://georgeo.zo.space/api/tiktok";

// Step 1: Analyze videos
const analyzeRes = await fetch(API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "analyze",
    videos: [
      { id: "1", url: "...", description: "...", likes: 50000, comments: 1000, shares: 500, views: 500000 }
    ]
  })
});
const { analyses, summary } = await analyzeRes.json();

// Step 2: Generate brief
const briefRes = await fetch(API_URL, {
  method: "POST", 
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "brief",
    clientName: "MyBrand",
    analyses,
    brandBible: { brandVoice: "confident", targetAudience: "Women 18-35" }
  })
});
const { brief } = await briefRes.json();

console.log(brief); // Full markdown brief
```

## Tech Stack

- **AI:** MiniMax M2.5 via Zo API
- **Framework:** Hono
- **Hosting:** zo.space (built-in) or Vercel

## License

MIT
