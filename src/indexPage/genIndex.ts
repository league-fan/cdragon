import { join } from "@std/path";
import { APP_URL } from "../constants.ts";
import { SUCCESS } from "../helpers.ts";

const savePath = join(Deno.cwd(), ".data", "index.html");

const template = `<!doctype html>
<html>
  <head>
    <title>Scalar API Reference</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <header class="custom-header scalar-app">
      <div class="header-container">
        <div class="header-title">CDragon-Assets API Reference</div>
        <nav class="header-nav">
          <a href="https://league-fan.github.io" class="nav-link">League-Fan</a>
          <a href="https://communitydragon.org" class="nav-link">CDragon</a>
          <a href="https://github.com/league-fan" class="nav-link">GitHub</a>
        </nav>
      </div>
    </header>
    <style>
    :root {
      --scalar-custom-header-height: 60px;
      --scalar-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: var(--scalar-font-family);
    }
    
    .custom-header {
      height: var(--scalar-custom-header-height);
      background-color: var(--scalar-background-1);
      box-shadow: inset 0 -1px 0 var(--scalar-border-color);
      color: var(--scalar-color-1);
      width: 100%;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .header-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      margin: 0 auto;
      padding: 0 16px;
    }
    
    .header-title {
      font-weight: 600;
      font-size: 16px;
    }
    
    .header-nav {
      display: flex;
      gap: 24px;
    }
    
    .nav-link {
      color: var(--scalar-color-2);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s ease;
    }
    
    .nav-link:hover {
      color: var(--scalar-color-1);
    }
    
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        padding: 12px 16px;
        height: auto;
      }
      
      .custom-header {
        height: auto;
      }
      
      .header-nav {
        margin-top: 8px;
      }
    }
  </style>
    <script
      id="api-reference"
      data-url="${APP_URL}/openapi.yml"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
`;

export async function genIndex() {
  await Deno.writeTextFile(savePath, template);
  SUCCESS(`Index page generated: ${savePath}`);
}
