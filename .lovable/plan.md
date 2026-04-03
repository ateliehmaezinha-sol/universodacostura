

# Plano: Corrigir Criar Roupa e Assistente de Costura

## Problema

Ambas as funções estão falhando porque:
1. A chave do Google Gemini é **inválida** (erro 400)
2. Quando tenta o fallback (Lovable AI), retorna erro 402 (créditos temporariamente esgotados)

## Solução

Remover completamente a dependência do Google Gemini (chave inválida) e usar **apenas o Lovable AI Gateway**, que já vem configurado automaticamente com o projeto e tem uso gratuito incluído mensalmente.

## Alterações

### 1. Edge Function `sewing-assistant/index.ts`
- Remover todo o bloco de chamada direta ao Google Gemini
- Usar apenas o Lovable AI Gateway com modelo `google/gemini-3-flash-preview`
- Adicionar tratamento de erros 402 (créditos) e 429 (rate limit) com mensagens claras em português

### 2. Edge Function `generate-clothing/index.ts`
- Remover todo o bloco de chamada direta ao Google Gemini
- Usar apenas o Lovable AI Gateway com modelo `google/gemini-2.5-flash-image` para gerar imagens
- Adicionar tratamento de erros 402/429 com mensagens amigáveis
- Manter upload da imagem gerada no storage

### 3. Deploy das funções
- Reimplantar ambas as Edge Functions

## Sobre custos

O Lovable AI Gateway oferece uso gratuito incluído mensalmente com o projeto. Não é necessária nenhuma chave externa. Caso o limite mensal seja atingido, uma mensagem clara será exibida para a usuária.

## Arquivos modificados
- `supabase/functions/sewing-assistant/index.ts`
- `supabase/functions/generate-clothing/index.ts`

