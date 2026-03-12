# TikTok Research Agent API

A research-to-brief pipeline that analyzes TikTok videos and generates creative briefs. Built with Hono, deployable to Vercel.

## What It Does

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/analyze` | POST | Analyze TikTok videos |
| `/api/brief` | POST | Generate creative brief |

## Quick Deploy

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Clone and deploy
git clone https://github.com/larsontrey720/tiktok-research-agent.git
cd tiktok-research-agent
vercel deploy --prod
```

### Option 2: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `larsontrey720/tiktok-research-agent`
3. Deploy

## API Usage

### Analyze Videos

```bash
curl -X POST https://your-project.vercel.app/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
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

**Response:**
```json
{
  "timestamp": "2026-03-12T...",
  "analyzedCount": 1,
  "analyses": [
    {
      "id": "123456789",
      "url": "...",
      "hook": {
        "type": "informational",
        "strength": "high",
        "analysis": "..."
      },
      "content": {
        "format": "tutorial",
        "pacing": "medium",
        "visualStyle": "authentic"
      },
      "engagement": {
        "likes": 100000,
        "comments": 5000,
        "shares": 2000,
        "views": 500000,
        "engagementRate": 20.14
      },
      "themes": ["skincare", "beauty"],
      "sentiment": "positive"
    }
  ],
  "summary": {
    "totalViews": 500000,
    "avgEngagement": 20.14
  }
}
```

### Generate Brief

```bash
curl -X POST https://your-project.vercel.app/api/brief \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "YourBrand",
    "analyses": [
      {
        "id": "123456789",
        "url": "https://www.tiktok.com/@username/video/123456789",
        "hook": {"type": "informational", "strength": "high"},
        "content": {"format": "tutorial", "pacing": "medium"},
        "engagement": {"views": 500000, "likes": 100000, "comments": 5000, "shares": 2000, "engagementRate": 20.14},
        "themes": ["skincare", "beauty"],
        "sentiment": "positive"
      }
    ],
    "brandBible": {
      "brandVoice": "confident",
      "targetAudience": "Young women 18-34"
    }
  }'
```

**Response:**
```json
{
  "clientName": "YourBrand",
  "timestamp": "2026-03-12T...",
  "brief": "# Creative Brief\n\n## Project Overview\n- **Client**: YourBrand\n...",
  "summary": {
    "totalVideosAnalyzed": 1,
    "totalViews": 500000,
    "avgEngagement": 20.14
  },
  "topHooks": ["informational"],
  "recommendedFormats": ["tutorial"],
  "contentThemes": ["skincare", "beauty"]
}
```

## Integration with Your App

```javascript
// Example: Your app sends video data
const videos = [
  { id: "1", url: "...", description: "...", likes: 10000, ... }
];

const response = await fetch('https://your-api.vercel.app/api/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ videos })
});

const { analyses, summary } = await response.json();

// Generate brief
const briefResponse = await fetch('https://your-api.vercel.app/api/brief', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    clientName: 'YourBrand', 
    analyses 
  })
});

const { brief } = await briefResponse.json();
console.log(brief);
```

## Local Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Test
npm run test
# or
curl -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" -d '{"videos":[{"id":"1","url":"test","description":"test","likes":100,"comments":10,"shares":5,"views":1000}]}'
```

## Tech Stack

- [Hono](https://hono.dev) - Web framework
- [Vercel](https://vercel.com) - Deployment

## License

MIT
