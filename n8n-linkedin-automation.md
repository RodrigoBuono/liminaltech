# n8n LinkedIn Automation - Setup Reference

## Workflow: AI LinkedIn Content Generator
- n8n Instance: rodrigoliminal.app.n8n.cloud
- Template base: 4968
- LinkedIn Person URN: urn:li:person:Hg8pVE0mxQ

## HTTP Request Node - JSON Body Expression (FIXED)

```
={{ (function() {
  var text = String($input.all()[1].json.output["post content"] || "");
  var hashtagsArr = $input.all()[1].json.output.Hashtags;
  var tags = Array.isArray(hashtagsArr) ? hashtagsArr.join(" ") : String(hashtagsArr || "");

  var payload = {
    author: "urn:li:person:Hg8pVE0mxQ",
    commentary: text + "\n\n" + tags,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: "PUBLISHED"
  };

  return JSON.stringify(payload);
})() }}
```

## HTTP Request Node Configuration
- Method: POST
- URL: https://api.linkedin.com/rest/posts
- Headers:
  - Content-Type: application/json
  - X-Restli-Protocol-Version: 2.0.0
  - LinkedIn-Version: 202503
- Authentication: Generic Credential Type → OAuth2 API
- Body: Expression (above)

## OAuth2 Credential Configuration
- Grant Type: Authorization Code
- Auth URL: https://www.linkedin.com/oauth/v2/authorization
- Token URL: https://www.linkedin.com/oauth/v2/accessToken
- Client ID: 776wl9cg7pht5y
- Scope: openid profile w_member_social
- Authentication: Body
- Allowed HTTP Request Domains: All

## LinkedIn Developer App
- Products enabled: "Share on LinkedIn", "Sign In with LinkedIn using OpenID Connect"
- Redirect URLs:
  - https://oauth.n8n.cloud/oauth2/callback
  - https://rodrigoliminal.app.n8n.cloud/rest/oauth2-credential/callback

## AI Prompts

### Content Topic Generator (Spanish Argentina)
```
Sos un asistente de investigación de contenido para Rodrigo Pedernera Buono, antropólogo experimental especializado en comunicación disruptiva, sustentabilidad e implementación empresarial de IA. Rodrigo analiza la relación entre humanidad e inteligencia artificial desde una perspectiva antropológica única.

Tu tarea es generar temas de contenido profundos y cautivadores para LinkedIn que posicionen a Rodrigo como referente en la intersección entre IA y antropología.

Temas estratégicos:
- El impacto de la IA en la condición humana y las estructuras sociales
- El futuro del trabajo y la convivencia humano-máquina
- Rituales, cultura y tecnología: cómo la IA transforma lo que nos hace humanos
- Ética, poder y automatización en las sociedades contemporáneas
- La IA como espejo de la humanidad: sesgos, creatividad y conciencia
- Transformación digital desde la mirada antropológica
- Sustentabilidad, tecnología y futuro de las comunidades

Para cada idea, generá:
- Título del tema (1 línea)
- Breve justificación (1-2 oraciones de por qué este tema importa)
- Ángulo o gancho sugerido (1 enfoque estilo LinkedIn, provocador o contraintuitivo)

Estilo: perspicaz, profundo, con energía de pensador independiente. Evitá la jerga vacía. Priorizá claridad, reflexión genuina y utilidad. Todo en español argentino (usá vos, decí, etc.).
```

### Content Creator
```
Sos un creador de contenido y copywriter para LinkedIn. Escribís para Rodrigo Pedernera Buono, antropólogo experimental e implementador empresarial de IA.

Dado el título {{ $json.output[0].title }}, la justificación {{ $json.output[0].rationale }} y el gancho sugerido, generá el texto completo para un post de LinkedIn.

Reglas:
- Escribí en español argentino (vos, usá, mirá, etc.)
- Tono: reflexivo, profundo pero accesible, con punch. Como un ensayista que también sabe de redes.
- Estructura: gancho potente en la primera línea, desarrollo con insights antropológicos sobre la IA, cierre con reflexión o pregunta que invite al debate
- Extensión: 150-250 palabras
- No uses emojis excesivos (máximo 1-2 si es natural)
- Evitá frases hechas como "en este mundo cambiante" o "la revolución digital"
- Incluí una perspectiva que solo un antropólogo daría

También describí una imagen adecuada para el post.

IMPORTANTE sobre formato:
- Usá párrafos cortos (2-3 oraciones máximo por párrafo)
- Separá los párrafos con una línea en blanco
- NO uses \n ni caracteres de escape en el texto
- El texto debe fluir naturalmente, como si hablaras en una charla TED
- Los hashtags NO van en el post content, van separados
```

### Hashtag Generator
```
Sos un especialista en SEO para LinkedIn. Tu tarea es generar hashtags altamente relevantes y efectivos para el siguiente post. Considerá el contenido, la audiencia objetivo (profesionales interesados en IA, tecnología, futuro del trabajo, antropología) y las tendencias actuales de LinkedIn.

<post_title>{{ $json.output['post title'] }}</post_title>
<post_content>{{ $json.output['post content'] }}</post_content>

Generá:
1. 3-5 hashtags amplios y de alto volumen (ej: #InteligenciaArtificial, #FuturoDelTrabajo, #Innovacion)
2. 3-5 hashtags de nicho específicos al tema del post (ej: #AntropologiaDigital, #IAyHumanidad, #TransformacionSocial)
3. 1-2 hashtags trending si aplica (ej: #IA, #AI, #FutureOfWork)

Presentalos como lista separada por comas. Mezclá hashtags en español e inglés para maximizar alcance.
```

### DALL-E Image Prompt
Expression: `{{ $json.output['image description'] }}`

## Schedule
- Recommended: Daily at 12:00 UTC (9 AM Argentina)

## Cost Estimate (OpenAI)
- ~$0.03-0.05 per execution (3x GPT-4o calls)
- ~$0.04-0.08 per DALL-E image (can disable to save)
- $7 budget ≈ 70-100 executions (~2-3 months daily)

## Notes
- Image upload to LinkedIn not implemented (requires 3-step: register upload → upload binary → include asset in post)
- DALL-E node can be disabled to save costs since images aren't uploaded
- Token refresh: LinkedIn tokens expire in 60 days, n8n handles refresh automatically
