import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Beta @supabase/supabase-js oauth namespace — local typed wrapper.
type OAuthAPI = {
  getAuthorizationDetails: (id: string) => Promise<{ data: any; error: any }>;
  approveAuthorization: (id: string) => Promise<{ data: any; error: any }>;
  denyAuthorization: (id: string) => Promise<{ data: any; error: any }>;
};
const oauth = (supabase.auth as unknown as { oauth: OAuthAPI }).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Solicitação de autorização inválida (authorization_id ausente).");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/?next=" + encodeURIComponent(next);
        return;
      }
      if (!oauth?.getAuthorizationDetails) {
        setError("Autorização OAuth indisponível nesta versão do backend.");
        return;
      }
      const { data, error } = await oauth.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message ?? "Não foi possível carregar a autorização.");
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    try {
      const { data, error } = approve
        ? await oauth.approveAuthorization(authorizationId)
        : await oauth.denyAuthorization(authorizationId);
      if (error) {
        setError(error.message ?? "Falha ao registrar a decisão.");
        setBusy(false);
        return;
      }
      const target = data?.redirect_url ?? data?.redirect_to;
      if (!target) {
        setError("O servidor de autorização não retornou uma URL de redirecionamento.");
        setBusy(false);
        return;
      }
      window.location.href = target;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
      setBusy(false);
    }
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full bg-card border border-border rounded-2xl p-6 space-y-3">
          <h1 className="font-display text-xl font-semibold">Não foi possível autorizar</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-3xl mb-3 animate-pulse">✨</div>
          <p className="text-sm text-muted-foreground">Carregando autorização…</p>
        </div>
      </main>
    );
  }

  const clientName = details.client?.name ?? "aplicativo externo";
  const redirectUri = details.client?.redirect_uri ?? details.client?.redirect_uris?.[0];
  const scopes: string[] = Array.isArray(details.scopes)
    ? details.scopes
    : typeof details.scope === "string"
      ? details.scope.split(/\s+/).filter(Boolean)
      : [];

  return (
    <main className="min-h-screen flex items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md bg-background rounded-3xl p-8 shadow-2xl space-y-5">
        <div className="text-center">
          <div className="text-4xl mb-2">✨</div>
          <h1 className="font-display text-2xl font-semibold">
            Conectar {clientName} ao Unicost IA
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            {clientName} poderá chamar as ferramentas do Unicost IA como você, enquanto você estiver conectada.
          </p>
        </div>

        <div className="text-sm space-y-2 bg-muted/40 rounded-xl p-4">
          {redirectUri && (
            <div>
              <span className="text-muted-foreground">Redireciona para: </span>
              <span className="font-mono text-xs break-all">{redirectUri}</span>
            </div>
          )}
          <div>
            <p className="text-muted-foreground mb-1">Permissões solicitadas:</p>
            <ul className="list-disc list-inside">
              {(scopes.length ? scopes : ["openid", "email", "profile"]).map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Isto não substitui as políticas de acesso do Unicost IA — RLS e regras do backend continuam válidas.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-11 rounded-xl"
            disabled={busy}
            onClick={() => decide(false)}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={busy}
            onClick={() => decide(true)}
          >
            {busy ? "Aguarde…" : "Autorizar"}
          </Button>
        </div>
      </div>
    </main>
  );
}
