import type { Env } from "./env"
import { routeRequest } from "./routes"

export default {
  fetch(request, env): Promise<Response> {
    return routeRequest(request, env)
  },
} satisfies ExportedHandler<Env>
