# TikTok Research Agent API

A research-to-brief pipeline that analyzes TikTok videos using MiniMax AI and generates creative briefs. Built with Hono.

## Quick Start

### Option 1: Use Zo (No Setup)

Your API is already live:

```
https://georgeo.zo.space/api/tiktok
```

No environment variables needed. Uses your Zo identity automatically.

### Option 2: Deploy to Vercel

```bash
# Clone the repo
git clone https://github.com/larsontrey720/tiktok-research-agent.git
cd tiktok-research-agent/api

# Deploy
vercel deploy --prod
```

Or import the repo in Vercel dashboard: https://vercel.com/new/import?repo=larsontrey720/tiktok-research-agent

#### Required Environment Variables (Vercel only)

Add in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `ZO_CLIENT_IDENTITY_TOKEN` | Your Zo identity token |

To get your token, run this in your Zo terminal:
```bash
echo $ZO_CLIENT_IDENTITY_TOKEN
```

## API Usage

All requests are POST to your endpoint:

```bash
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
```

### Actions

| Action | Description |
|--------|-------------|
| `analyze` | Analyze videos with AI |
| `brief` | Generate creative brief |

---

## Action: Analyze

### Request

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

### Response

```json
{
  "timestamp": "2026-03-12T14:22:18.264Z",
  "action": "analyze",
  "analyzedCount": 1,
  "analyses": [
    {
      "id": "123456789",
      "url": "https://www.tiktok.com/@username/video/123456789",
      "hook": {
        "type": "question|statement|trend|before_after|edu",
        "strength": "high|medium|low",
        "analysis": "AI-generated hook analysis"
      },
      "content": {
        "format": "tutorial|story|list|transformation|UGC",
        "pacing": "fast|medium|slow",
        "visualStyle": "polished|authentic|minimal"
      },
      "engagement": {
        "likes": 100000,
        "comments": 5000,
        "shares": 2000,
        "views": 500000,
        "engagementRate": 14
      },
      "themes": ["skincare", "routine", "tips"],
      "sentiment": "positive|neutral|mixed",
      "audienceQuestions": ["What products?", "How long?"]
    }
  ],
  "summary": {
    "totalViews": 500000,
    "avgEngagement": 14,
    "topHooks": ["question", "statement"],
    "topFormats": ["tutorial", "list"]
  }
}
```

---

## Action: Brief

### Request

```json
{
  "action": "brief",
  "clientName": "YourBrand",
  "analyses": [
    {
      "id": "123456789",
      "url": "...",
      "hook": {"type": "question", "strength": "high"},
      "content": {"format": "tutorial", "pacing": "medium", "visualStyle": "polished"},
      "engagement": {"views": 500000, "likes": 100000, "comments": 5000, "shares": 2000, "engagementRate": 14},
      "themes": ["skincare", "beauty"],
      "sentiment": "positive"
    }
  ],
  "brandBible": {
    "brandVoice": "confident and approachable",
    "targetAudience": "Women 18-35",
    "keyMessages": ["Natural beauty", "Simple routine"]
  }
}
```

### Response

```json
{
  "timestamp": "2026-03-12T14:23:07.357Z",
  "action": "brief",
  "clientName": "YourBrand",
  "brief": "# Creative Brief\n\n## Project Overview\n- **Client**: YourBrand\n...\n",
  "summary": {
    "totalVideosAnalyzed": 1,
    "totalViews": 500000,
    "avgEngagement": 14,
    "topHooks": ["question"],
    "recommendedFormats": ["tutorial", "list"],
    "contentThemes": ["skincare", "beauty"]
  }
}
```

---

## Integration Examples

### JavaScript/TypeScript

```javascript
const BASE_URL = 'https://georgeo.zo.space/api/tiktok'; // or your Vercel URL

// Step 1: Analyze videos
const analyzeRes = await fetch(BASE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'analyze',
    videos: [
      { id: '1', url: '...', description: '...', likes: 100000, comments: 5000, shares: 2000, views: 500000 }
    ]
  })
});

const { analyses, summary } = await analyzeRes.json();

// Step 2: Generate brief
const briefRes = await fetch(BASE_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'brief',
    clientName: 'MyBrand',
    analyses,
    brandBible: {
      brandVoice: 'confident',
      targetAudience: 'Young women 18-34'
    }
  })
});

const { brief } = await briefRes.json();
console.log(brief);
```

### Python

```python
import requests

BASE_URL = 'https://georgeo.zo.space/api/tiktok'

# Analyze
analyze_resp = requests.post(f'{BASE_URL}', json={
    'action': 'analyze',
    'videos': [{
        'id': '1',
        'url': 'https://tiktok.com/@user/video/1',
        'description': 'My skincare routine',
        'likes': 100000,
        'comments': 5000,
        'shares': 2000,
        'views': 500000
    }]
})

analyses = analyze_resp.json()['analyses']

# Generate brief
brief_resp = requests.post(f'{BASE_URL}', json={
    'action': 'brief',
    'clientName': 'MyBrand',
    'analyses': analyses,
    'brandBible': {
        'brandVoice': 'confident',
        'targetAudience': 'Women 18-35'
    }
})

print(brief_resp.json()['brief'])
```

### cURL

```bash
# Analyze
curl -X POST https://georgeo.zo.space/api/tiktok \
  -H "Content-Type: application/json" \
  -d '{
    "action": "analyze",
    "videos": [
      {"id": "1", "url": "https://tiktok.com/v/1", "description": "test", "likes": 10000, "comments": 500, "shares": 200, "views": 100000}
    ]
  }'

# Brief (uses analysis from above)
curl -X POST https://georgeo.zo.space/api/tiktok \
  -H "Content-Type: application/json" \
  -d '{
    "action": "brief",
    "clientName": "MyBrand",
    "analyses": [{"id": "1", "hook": {"type": "question", "strength": "high"}, "content": {"format": "tutorial"}, "engagement": {"views": 100000, "likes": 10000, "comments": 500, "shares": 200, "engagementRate": 10.7}}],
    "brandBible": {"brandVoice": "confident", "targetAudience": "Women 18-35"}
  }'
```

---

## Endpoints Summary

| Platform | URL |
|----------|-----|
| **Zo (live now)** | `https://georgeo.zo.space/api/tiktok` |
| **Vercel** | `https://your-project.vercel.app/api/tiktok` |

---

## Tech Stack

- **Framework:** Hono
- **AI:** MiniMax via Zo API
- **Hosting:** zo.space (built-in) or Vercel

## License

MIT
