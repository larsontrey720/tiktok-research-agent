#!/usr/bin/env bun
/**
 * API Test Script
 * 
 * Tests the TikTok Research Agent API locally.
 * Run: bun run api/test.ts
 */

import { fetch } from "undici";

// Base URL - change for production
const BASE_URL = process.env.API_URL || "http://localhost:3000";

// Test data
const testVideos = [
  {
    id: "1234567890",
    url: "https://www.tiktok.com/@user/video/1234567890",
    description: "My morning skincare routine! #skincare #routine",
    author: "@user",
    likes: 4500000,
    comments: 23000,
    shares: 15000,
    views: 25000000,
  },
  {
    id: "2345678901",
    url: "https://www.tiktok.com/@user2/video/2345678901",
    description: "How to layer skincare products correctly #skincare #tips",
    author: "@user2",
    likes: 85000,
    comments: 1200,
    shares: 800,
    views: 450000,
  },
  {
    id: "3456789012",
    url: "https://www.tiktok.com/@user3/video/3456789012",
    description: "Best drugstore skincare products 2024 #skincare #budget",
    author: "@user3",
    likes: 67800,
    comments: 890,
    shares: 450,
    views: 320000,
  },
];

async function testEndpoint(name: string, endpoint: string, payload: object) {
  console.log(`\n🧪 Testing ${name}...`);
  console.log(`   POST ${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ ${response.status} - OK`);
      console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}...`);
      return data;
    } else {
      console.log(`   ❌ ${response.status} - Error`);
      console.log(`   Error: ${JSON.stringify(data)}`);
      return null;
    }
  } catch (err) {
    console.log(`   ❌ Connection failed: ${err}`);
    return null;
  }
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🧪 TikTok Research Agent API - Test Suite                 ║
╚══════════════════════════════════════════════════════════════╝
  `);

  // Test 1: Health check
  console.log("\n🧪 Testing health check...");
  try {
    const response = await fetch(BASE_URL);
    const data = await response.json();
    console.log(`   ✅ ${JSON.stringify(data).substring(0, 100)}`);
  } catch (err) {
    console.log(`   ❌ Server not running. Start with: cd api && bun run dev`);
    console.log(`   Or deploy to Vercel and set API_URL`);
    process.exit(1);
  }

  // Test 2: Search
  const searchResult = await testEndpoint(
    "Search",
    "/api/search",
    {
      keyword: "skincare",
      videos: testVideos,
    }
  );

  // Test 3: Analyze
  const analyzeResult = await testEndpoint(
    "Analyze",
    "/api/analyze",
    {
      videos: testVideos,
    }
  );

  // Test 4: Brief
  const briefResult = await testEndpoint(
    "Brief Generation",
    "/api/brief",
    {
      clientName: "TestBrand",
      projectName: "Q1 TikTok Campaign",
      analyses: analyzeResult?.analyses || [],
      brandBible: {
        brandVoice: "Confident, approachable, expert",
        targetAudience: "Women 18-35 interested in skincare",
      },
    }
  );

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ✅ Test Suite Complete                                      ║
╚══════════════════════════════════════════════════════════════╝

To deploy to Vercel:
  cd Skills/tiktok-research-agent/api
  vercel deploy --prod
  `);
}

main();
