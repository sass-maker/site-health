import { startDashboardService } from './service.mjs';
import { hostedConfiguration, hostedListenPort, startHostedDashboardService } from './hosted.mjs';

export function ownerListenerConfiguration(env = process.env, portArgument) {
  if (env.SITE_HEALTH_TUNNEL && env.SITE_HEALTH_TUNNEL !== '1') {
    throw new Error('SITE_HEALTH_TUNNEL must be 1 when enabled');
  }
  const tunnel = env.SITE_HEALTH_TUNNEL === '1';
  const hosted = hostedConfiguration(env)
    ?? (tunnel ? hostedConfiguration({ ...env, SITE_HEALTH_HOSTED: '1' }) : null);
  const port = hostedListenPort(portArgument ?? (hosted && !tunnel ? env.PORT : undefined));
  const tunnelPort = tunnel ? hostedListenPort(env.SITE_HEALTH_TUNNEL_PORT ?? '4188') : null;
  if (tunnel && port === tunnelPort) throw new Error('The local and tunnel dashboard ports must differ');
  return { hosted, tunnel, port, tunnelPort };
}

export async function startOwnerListeners({ listeners, ...options }) {
  const servers = [];
  try {
    if (!listeners.hosted || listeners.tunnel) {
      servers.push(await startDashboardService({ ...options, host: '127.0.0.1', port: listeners.port }));
    }
    if (listeners.hosted) {
      servers.push(await startHostedDashboardService({ ...options, config: listeners.hosted,
        host: '127.0.0.1', port: listeners.tunnel ? listeners.tunnelPort : listeners.port }));
    }
    return servers;
  } catch (error) {
    await Promise.all(servers.map(server => new Promise(resolve => server.close(resolve))));
    throw error;
  }
}
