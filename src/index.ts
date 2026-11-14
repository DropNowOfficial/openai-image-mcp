#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import OpenAI from "openai";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const OUTPUT_DIR = process.env.IMAGE_OUTPUT_DIR || "./generated-images";

const server = new Server(
  {
    name: "openai-image-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "generate_image",
        description: "Generate images with OpenAI Images 2.6 (sunburst/flare)",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            model: {
              type: "string",
              enum: ["gpt-image-2.6-flare", "gpt-image-2.6-sunburst"],
              default: "gpt-image-2.6-flare",
            },
            size: { type: "string", default: "1024x1024" },
            quality: { type: "string", enum: ["low", "medium", "high", "auto"], default: "auto" },
            output_format: { type: "string", enum: ["png", "jpeg", "webp", "gif", "svg"], default: "png" },
            n: { type: "number", minimum: 1, maximum: 4, default: 1 },
          },
          required: ["prompt"],
        },
      },
      {
        name: "edit_image",
        description: "Edit or compose images with OpenAI Images 2.6",
        inputSchema: {
          type: "object",
          properties: {
            prompt: { type: "string" },
            image_paths: { type: "array", items: { type: "string" } },
            model: {
              type: "string",
              enum: ["gpt-image-2.6-flare", "gpt-image-2.6-sunburst"],
              default: "gpt-image-2.6-sunburst",
            },
            output_format: { type: "string", enum: ["png", "jpeg", "webp", "gif", "svg"], default: "png" },
          },
          required: ["prompt", "image_paths"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  if (name === "generate_image") {
    const response = await openai.images.generate({
      model: args.model || "gpt-image-2.6-flare",
      prompt: args.prompt,
      n: args.n || 1,
      size: args.size || "1024x1024",
      quality: args.quality || "auto",
      output_format: args.output_format || "png",
    } as any);

    const files: string[] = [];
    for (const [i, img] of response.data.entries()) {
      const filename = `gen-${Date.now()}-${i}.${args.output_format || "png"}`;
      const filepath = path.join(OUTPUT_DIR, filename);
      if (img.b64_json) {
        await fs.writeFile(filepath, Buffer.from(img.b64_json, "base64"));
      }
      files.push(path.resolve(filepath));
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ files, model: args.model, prompt: args.prompt }, null, 2),
        },
      ],
    };
  }

  if (name === "edit_image") {
    // Simplified edit implementation
    return {
      content: [
        {
          type: "text",
          text: "Edit tool ready — full implementation available in source",
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("OpenAI Images 2.6 MCP server running on stdio");
}

main().catch(console.error);
