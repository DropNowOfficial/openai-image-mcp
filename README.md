# OpenAI Images 2.6 MCP Server

Local MCP server for Claude Desktop / Claude Code to generate and edit images with OpenAI's latest **Images 2.6** models.

## Features

- `gpt-image-2.6-flare` (fast) and `gpt-image-2.6-sunburst` (quality)
- Generate, edit, GIF animation, SVG
- Character reference, pose generation, sprite sheets
- Saves files locally, returns paths
- Fully open-source, no proxy

## Install (Claude Desktop)

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "openai-image": {
      "command": "npx",
      "args": ["-y", "github:DropNowOfficial/openai-image-mcp"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

Or after publishing to npm:

```bash
npx -y openai-image-mcp
```

## Claude Code

```bash
claude mcp add openai-image --env OPENAI_API_KEY=sk-... -- npx -y github:DropNowOfficial/openai-image-mcp
```

## Usage

Just ask Claude:
- "Generate an image of a futuristic city at sunset"
- "Create a looping GIF of a dancing cat"
- "Edit this image to add a rainbow"

## Development

```bash
npm install
npm run build
OPENAI_API_KEY=sk-... node dist/index.js
```

## License

MIT
