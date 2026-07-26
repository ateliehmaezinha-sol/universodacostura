import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import calculateFabricTool from "./tools/calculate-fabric";
import askSewingAssistantTool from "./tools/ask-sewing-assistant";

// Direct Supabase issuer (never the .lovable.cloud proxy). Vite inlines this at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "unicost-ia-mcp",
  title: "Unicost IA MCP",
  version: "0.1.0",
  instructions:
    "Ferramentas do Unicost IA (Atelieh Mãezinha): consultar perfil da costureira, calcular metragem de tecido para peças e conversar com a assistente de costura IA.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfileTool, calculateFabricTool, askSewingAssistantTool],
});
