import { exists, walk } from "@std/fs";
import { join } from "@std/path";
import { APP_URL, Language } from "../constants.ts";
import { stringify } from "@std/yaml";
import { ERROR, INFO, SUCCESS } from "../helpers.ts";

const DATA_ROOT = "./.data";

/**
 * Get all files in a directory
 * @param dirPath directory path
 * @returns array of file paths
 */
async function getFilesInDirectory(dirPath: string): Promise<string[]> {
  const files: string[] = [];

  try {
    for await (const entry of walk(dirPath, { exts: [".json"] })) {
      if (entry.isFile) {
        files.push(entry.path);
      }
    }
    return files;
  } catch (error) {
    ERROR(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

/**
 * Generate API route mapping
 */
async function generateApiRoutes(locales: Language[], categories: string[]) {
  const routes: Record<string, any> = {
    "/version.json": {
      file: join(DATA_ROOT, "version.json"),
      type: "version",
    },
    "/wiki-skin-data.json": {
      file: join(DATA_ROOT, "wiki-skin-data.json"),
      type: "wiki",
    },
  };

  // Generate routes for each locale and category
  for (const locale of locales) {
    for (const category of categories) {
      const basePath = join(DATA_ROOT, locale, category);

      try {
        // Check if directory exists
        if (!await exists(basePath)) continue;
        const dirInfo = await Deno.stat(basePath);
        if (!dirInfo.isDirectory) continue;

        // Get all JSON files in the directory
        const files = await getFilesInDirectory(basePath);

        // Add list route
        const localeRoute = `/${locale}/${category}.json`;
        routes[localeRoute] = {
          type: "list",
          category,
          locale,
          count: files.length,
        };

        // Add individual item routes
        for (const file of files) {
          const fileName = file.split("/").pop()?.replace(".json", "") || "";
          const itemRoute = `/${locale}/${category}/${fileName}.json`;

          routes[itemRoute] = {
            type: "item",
            category,
            locale,
            id: fileName,
            file,
          };
        }
      } catch (error) {
        ERROR(`Error processing ${basePath}:`, error);
      }
    }
  }

  return routes;
}

/**
 * Generate OpenAPI documentation from route data
 */
export async function generateOpenApiDoc() {
  const locales = Array.from(
    Deno.readDirSync(DATA_ROOT).filter((dir) => dir.isDirectory).map((dir) =>
      dir.name
    ),
  ) as Language[];
  const categories = Array.from(
    Deno.readDirSync(join(DATA_ROOT, locales[0])).filter((dir) =>
      dir.isDirectory
    )
      .map((dir) => dir.name),
  ) as string[];
  const version_string = Deno.readTextFileSync(join(DATA_ROOT, "version.json"));
  const version = JSON.parse(version_string) as {
    version: string;
    crawledAt: Date;
  };
  const routes = await generateApiRoutes(locales, categories);
  const pathsCount = Object.keys(routes).length;

  INFO(`Generated ${pathsCount} API routes`);
  INFO(`Available locales: ${locales.join(", ")}`);
  INFO(`Available categories: ${categories.join(", ")}`);

  // Create OpenAPI specification
  const openApiSpec = {
    openapi: "3.0.3",
    info: {
      title: "CDragon Assets API",
      description:
        "League of Legends game resource data API, providing data from communitydragon.org including champions, skins, skinlines, and universe data",
      version: version.version,
      contact: {
        name: "CDragon Assets",
      },
    },
    servers: [
      {
        url: APP_URL,
        description: "Production API server",
      },
    ],
    tags: [
      { name: "Version", description: "Version-related information" },
      { name: "Champions", description: "Champion-related data" },
      { name: "Skins", description: "Skin-related data" },
      { name: "Skinlines", description: "Skinline-related data" },
      { name: "Universe", description: "Universe-related data" },
      { name: "Wiki", description: "Wiki-related data" },
    ],
    paths: generatePaths(),
    components: {
      parameters: {
        locale: {
          name: "locale",
          in: "path",
          required: true,
          description: "Language/locale code",
          schema: {
            type: "string",
            enum: locales,
            default: "default",
          },
        },
      },
      schemas: generateSchemas(),
    },
  };

  // Write OpenAPI spec to file
  const openApiYaml = stringify(openApiSpec);
  const outputPath = join(DATA_ROOT, "openapi.yml");

  try {
    await Deno.writeTextFile(outputPath, openApiYaml);
    SUCCESS(`OpenAPI specification written to ${outputPath}`);
  } catch (error) {
    ERROR(`Error writing OpenAPI spec:`, error);
  }
}

/**
 * Generate paths section for OpenAPI spec
 */
function generatePaths() {
  const paths: Record<string, any> = {
    "/version.json": {
      get: {
        summary: "Get current data version",
        description: "Returns version information about the current API data",
        operationId: "getVersion",
        tags: ["Version"],
        responses: {
          "200": {
            description: "Successfully retrieved version information",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Version" },
              },
            },
          },
        },
      },
    },
    "/wiki-skin-data.json": {
      get: {
        summary: "Get Wiki skin data",
        description:
          "Returns skin-related data compiled from the League of Legends Wiki",
        operationId: "getWikiSkinData",
        tags: ["Wiki"],
        responses: {
          "200": {
            description: "Successfully retrieved Wiki skin data",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  description: "Wiki skin data",
                },
              },
            },
          },
        },
      },
    },
  };

  const localeParam = { $ref: "#/components/parameters/locale" };

  // Champion endpoints
  paths[`/{locale}/champion.json`] = {
    get: {
      summary: "Get all champions",
      description: "Returns a list of all champions in the specified language",
      operationId: "getChampions",
      tags: ["Champions"],
      parameters: [localeParam],
      responses: {
        "200": {
          description: "Successfully retrieved champion list",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/ChampionSummary" },
              },
            },
          },
        },
      },
    },
  };

  paths[`/{locale}/champion/{championAlias}.json`] = {
    get: {
      summary: "Get specific champion details",
      description:
        "Returns detailed information about a specific champion in the specified language",
      operationId: "getChampionById",
      tags: ["Champions"],
      parameters: [
        localeParam,
        {
          name: "championAlias",
          in: "path",
          required: true,
          description:
            "Champion alias (usually the champion name, e.g., Aatrox)",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Successfully retrieved champion details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Champion" },
            },
          },
        },
        "404": {
          description: "Champion not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  };

  // Skin endpoints
  paths[`/{locale}/skin.json`] = {
    get: {
      summary: "Get all skins",
      description: "Returns a list of all skins in the specified language",
      operationId: "getSkins",
      tags: ["Skins"],
      parameters: [localeParam],
      responses: {
        "200": {
          description: "Successfully retrieved skin list",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/SkinSummary" },
              },
            },
          },
        },
      },
    },
  };

  paths[`/{locale}/skin/{skinId}.json`] = {
    get: {
      summary: "Get specific skin details",
      description:
        "Returns detailed information about a specific skin in the specified language",
      operationId: "getSkinById",
      tags: ["Skins"],
      parameters: [
        localeParam,
        {
          name: "skinId",
          in: "path",
          required: true,
          description: "Skin ID (numeric ID, e.g., 1000, 10001)",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Successfully retrieved skin details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Skin" },
            },
          },
        },
        "404": {
          description: "Skin not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  };

  // Skinline endpoints
  paths[`/{locale}/skinline.json`] = {
    get: {
      summary: "Get all skinlines",
      description: "Returns a list of all skinlines in the specified language",
      operationId: "getSkinlines",
      tags: ["Skinlines"],
      parameters: [localeParam],
      responses: {
        "200": {
          description: "Successfully retrieved skinline list",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/SkinlineSummary" },
              },
            },
          },
        },
      },
    },
  };

  paths[`/{locale}/skinline/{skinlineId}.json`] = {
    get: {
      summary: "Get specific skinline details",
      description:
        "Returns detailed information about a specific skinline in the specified language",
      operationId: "getSkinlineById",
      tags: ["Skinlines"],
      parameters: [
        localeParam,
        {
          name: "skinlineId",
          in: "path",
          required: true,
          description: "Skinline ID (numeric ID, e.g., 0, 1, 10)",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Successfully retrieved skinline details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Skinline" },
            },
          },
        },
        "404": {
          description: "Skinline not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  };

  // Universe endpoints
  paths[`/{locale}/universe.json`] = {
    get: {
      summary: "Get all universes",
      description: "Returns a list of all universes in the specified language",
      operationId: "getUniverses",
      tags: ["Universe"],
      parameters: [localeParam],
      responses: {
        "200": {
          description: "Successfully retrieved universe list",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/UniverseSummary" },
              },
            },
          },
        },
      },
    },
  };

  paths[`/{locale}/universe/{universeId}.json`] = {
    get: {
      summary: "Get specific universe details",
      description:
        "Returns detailed information about a specific universe in the specified language",
      operationId: "getUniverseById",
      tags: ["Universe"],
      parameters: [
        localeParam,
        {
          name: "universeId",
          in: "path",
          required: true,
          description: "Universe ID (numeric ID, e.g., 0, 1, 10)",
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Successfully retrieved universe details",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Universe" },
            },
          },
        },
        "404": {
          description: "Universe not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
      },
    },
  };

  return paths;
}

/**
 * Generate schemas section for OpenAPI spec
 */
function generateSchemas() {
  return {
    Error: {
      type: "object",
      required: ["code", "message"],
      properties: {
        code: {
          type: "integer",
          format: "int32",
        },
        message: {
          type: "string",
        },
      },
    },
    Version: {
      type: "object",
      description: "API data version information",
      properties: {
        version: {
          type: "string",
          description: "API data version",
        },
        crawledAt: {
          type: "string",
          description: "API data crawled at",
          format: "date-time",
        },
      },
    },
    ChampionSummary: {
      type: "object",
      description: "Champion summary information",
      properties: {
        total: {
          type: "number",
          description: "Total number of champions",
        },
        champions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              alias: { type: "string" },
            },
          },
        },
      },
    },
    Champion: {
      type: "object",
      description: "Detailed champion information",
      properties: {
        id: {
          type: "number",
          description: "Champion ID",
        },
        name: {
          type: "string",
          description: "Champion name",
        },
        alias: {
          type: "string",
          description: "Champion alias",
        },
        squarePortraitPath: {
          type: "string",
          description: "Champion square portrait path",
        },
      },
    },
    SkinSummary: {
      type: "object",
      description: "Skin summary information",
      properties: {
        total: {
          type: "number",
          description: "Total number of skins",
        },
        skins: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    },
    Skin: {
      type: "object",
      description: "Detailed skin information",
      properties: {
        id: {
          type: "string",
          description: "Skin ID",
        },
        name: {
          type: "string",
          description: "Skin name",
        },
      },
    },
    SkinlineSummary: {
      type: "object",
      description: "Skinline summary information",
      properties: {
        total: {
          type: "number",
          description: "Total number of skinlines",
        },
        skinlines: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    },
    Skinline: {
      type: "object",
      description: "Detailed skinline information",
      properties: {
        id: {
          type: "string",
          description: "Skinline ID",
        },
        name: {
          type: "string",
          description: "Skinline name",
        },
      },
    },
    UniverseSummary: {
      type: "object",
      description: "Universe summary information",
      properties: {
        total: {
          type: "number",
          description: "Total number of universes",
        },
        universes: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
            },
          },
        },
      },
    },
    Universe: {
      type: "object",
      description: "Detailed universe information",
      properties: {
        id: {
          type: "string",
          description: "Universe ID",
        },
        name: {
          type: "string",
          description: "Universe name",
        },
      },
    },
  };
}

if (import.meta.main) {
  console.log("Starting API route generation...");
  await generateOpenApiDoc();
  console.log("API route generation complete!");
}
